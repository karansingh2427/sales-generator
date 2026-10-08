"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  DEFAULT_GEO_FILTER,
  GEO_LABELS,
  type GeoCode,
} from "@/lib/geo";
import { ICP_GEOGRAPHY } from "@/lib/willow-context";
import type {
  ColumnMapping,
  ImportPreviewResult,
  ImportPreviewRow,
  SalesNavField,
} from "@/lib/sales-nav-import";
import { SALES_NAV_FIELD_LABELS } from "@/lib/sales-nav-import";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileSpreadsheet, CheckCircle2 } from "lucide-react";

const GEO_OPTIONS: GeoCode[] = ["BE", "NL"];

const MAP_FIELDS: SalesNavField[] = [
  "firstName",
  "lastName",
  "fullName",
  "title",
  "company",
  "email",
  "linkedInUrl",
  "location",
  "companyLocation",
  "industry",
  "companySize",
];

type Props = {
  onImported: (count: number) => void;
  onError: (msg: string) => void;
  onStatus: (msg: string) => void;
};

export function SalesNavImportPanel({ onImported, onError, onStatus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [csvText, setCsvText] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [geoFilter, setGeoFilter] = useState<GeoCode[]>([...DEFAULT_GEO_FILTER]);
  const [minScore, setMinScore] = useState(70);
  const [preview, setPreview] = useState<ImportPreviewResult | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [busy, setBusy] = useState(false);

  const selectedCount = useMemo(() => rows.filter((r) => r.selected).length, [rows]);

  const runPreview = useCallback(
    async (text: string, map?: ColumnMapping, geos?: GeoCode[], score?: number) => {
      setBusy(true);
      onError("");
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "import_preview",
            csvText: text,
            mapping: map,
            geoFilter: geos ?? geoFilter,
            minScore: score ?? minScore,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          onError(data.error ?? "Preview failed");
          return;
        }
        const p = data.preview as ImportPreviewResult;
        setPreview(p);
        setMapping(p.mapping);
        setRows(p.rows);
        onStatus(
          `Preview: ${p.summary.total} rows · ${p.summary.afterGeo} in geo filter · ${p.summary.highIcp} ready to import (human review).`,
        );
      } catch {
        onError("Could not preview CSV.");
      } finally {
        setBusy(false);
      }
    },
    [geoFilter, minScore, onError, onStatus],
  );

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv") && file.type !== "text/csv") {
      onError("Please drop a Sales Navigator CSV export (.csv).");
      return;
    }
    const text = await file.text();
    setCsvText(text);
    setFileName(file.name);
    await runPreview(text);
  }

  function toggleGeo(code: GeoCode) {
    setGeoFilter((prev) => {
      const next = prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code];
      // Always keep at least one
      return next.length === 0 ? [...DEFAULT_GEO_FILTER] : next;
    });
  }

  async function rePreview() {
    if (!csvText) return;
    await runPreview(csvText, mapping, geoFilter, minScore);
  }

  function updateMapping(field: SalesNavField, header: string) {
    setMapping((m) => {
      const next = { ...m };
      if (!header || header === "__none__") delete next[field];
      else next[field] = header;
      return next;
    });
  }

  function toggleRow(idx: number) {
    setRows((rs) =>
      rs.map((r) => (r.rowIndex === idx ? { ...r, selected: !r.selected } : r)),
    );
  }

  function selectAllPassing() {
    setRows((rs) =>
      rs.map((r) => ({
        ...r,
        selected: r.passesGeoFilter && !r.isDuplicate && r.icpScore >= minScore,
      })),
    );
  }

  function clearSelection() {
    setRows((rs) => rs.map((r) => ({ ...r, selected: false })));
  }

  async function commitImport() {
    const selected = rows.filter((r) => r.selected);
    if (selected.length === 0) {
      onError("Select at least one lead after review — nothing is imported silently.");
      return;
    }
    setBusy(true);
    onError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import_commit",
          rows: selected.map((r) => ({
            contactName: r.contactName,
            title: r.title,
            firmName: r.firmName,
            email: r.email,
            linkedInUrl: r.linkedInUrl || undefined,
            location: r.location,
            practiceArea: r.practiceArea,
            firmSize: r.firmSize,
            icpScore: r.icpScore,
            notes: r.icpRationale,
            geoCode: r.geoCode,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        onError(data.error ?? "Import failed");
        return;
      }
      const n = data.added?.length ?? 0;
      onImported(n);
      onStatus(
        `Imported ${n} Sales Nav lead(s)${
          data.skippedDuplicates ? ` · skipped ${data.skippedDuplicates} duplicate(s)` : ""
        }. Drafts stay human-reviewed — no auto-send.`,
      );
      setCsvText(null);
      setFileName(null);
      setPreview(null);
      setRows([]);
    } catch {
      onError("Import commit failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="border-primary/25">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-primary" />
          Import LinkedIn Sales Navigator
        </CardTitle>
        <CardDescription>
          Primary lead path for Floor. Default geo filter:{" "}
          <strong>{ICP_GEOGRAPHY.defaultFilterLabel}</strong> ({ICP_GEOGRAPHY.primaryMarkets}).
          Preview & select before import — no silent blast.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center transition-colors ${
            dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) void handleFile(f);
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm">
            Drag & drop a Sales Nav <strong>Lead List CSV</strong>, or
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            Choose CSV file
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.target.value = "";
            }}
          />
          {fileName && (
            <p className="text-xs text-muted-foreground">Loaded: {fileName}</p>
          )}
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Geo filter (Netherlands first · BE second · NL+BE only)</Label>
            <div className="flex flex-wrap gap-1.5">
              {GEO_OPTIONS.map((code) => {
                const on = geoFilter.includes(code);
                return (
                  <Button
                    key={code}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => toggleGeo(code)}
                  >
                    {code}
                  </Button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground max-w-md">
              {ICP_GEOGRAPHY.description}
            </p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Min ICP score</Label>
            <Input
              type="number"
              min={50}
              max={98}
              className="w-20"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value) || 70)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={!csvText || busy}
            onClick={() => void rePreview()}
          >
            Re-score preview
          </Button>
        </div>

        {preview && preview.headers.length > 0 && (
          <>
            <div className="space-y-2">
              <Label className="text-xs">Column map (auto-detected — adjust if needed)</Label>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {MAP_FIELDS.map((field) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">
                      {SALES_NAV_FIELD_LABELS[field]}
                    </Label>
                    <Select
                      value={mapping[field] ?? "__none__"}
                      onValueChange={(v) => v && updateMapping(field, v)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="—" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">— not mapped —</SelectItem>
                        {preview.headers.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void rePreview()}
              >
                Apply mapping
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{preview.summary.total} rows</Badge>
              <Badge variant="secondary">{preview.summary.afterGeo} in geo</Badge>
              <Badge variant="outline">{preview.summary.duplicates} duplicates</Badge>
              <Badge>{preview.summary.highIcp} suggested</Badge>
              <span className="text-xs text-muted-foreground">Selected: {selectedCount}</span>
              <Button type="button" size="sm" variant="ghost" onClick={selectAllPassing}>
                Select suggested
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            <ScrollArea className="h-[280px] w-full rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">In</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Firm</TableHead>
                    <TableHead>Geo</TableHead>
                    <TableHead>ICP</TableHead>
                    <TableHead>Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={r.rowIndex}
                      className={!r.passesGeoFilter ? "opacity-50" : undefined}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={r.selected}
                          disabled={r.isDuplicate}
                          onChange={() => toggleRow(r.rowIndex)}
                          aria-label={`Select ${r.contactName}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-sm">{r.contactName}</div>
                        <div className="text-xs text-muted-foreground">{r.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{r.firmName}</div>
                        <div className="text-xs text-muted-foreground">{r.location}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.geoTier === "primary" ? "default" : "outline"}>
                          {r.geoCode} · {GEO_LABELS[r.geoCode]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.icpScore >= 85 ? "default" : "secondary"}>
                          {r.icpScore}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs space-x-1">
                        {r.isDuplicate && <Badge variant="outline">duplicate</Badge>}
                        {!r.passesGeoFilter && <Badge variant="outline">filtered</Badge>}
                        {r.passesGeoFilter && !r.isDuplicate && r.icpScore >= minScore && (
                          <span className="inline-flex items-center gap-0.5 text-primary">
                            <CheckCircle2 className="h-3 w-3" /> suggested
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={busy || selectedCount === 0} onClick={() => void commitImport()}>
                Import {selectedCount} selected lead{selectedCount === 1 ? "" : "s"}
              </Button>
              <p className="text-xs text-muted-foreground self-center">
                Human-in-the-loop: nothing is emailed or InMailed automatically.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
