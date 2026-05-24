import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Palette, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  InvoiceStyleOptions,
  DEFAULT_STYLE_OPTIONS,
  DateFormat,
  AlignOption,
} from '@/types/invoiceDisplayOptions';

interface Props {
  style: InvoiceStyleOptions;
  onChange: (next: InvoiceStyleOptions) => void;
}

const AlignButtons: React.FC<{
  value: AlignOption;
  onChange: (v: AlignOption) => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-1">
    {(['left', 'center', 'right'] as AlignOption[]).map((a) => {
      const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
      return (
        <Button
          key={a}
          type="button"
          size="icon"
          variant={value === a ? 'default' : 'outline'}
          className="h-8 w-8"
          onClick={() => onChange(a)}
        >
          <Icon className="h-4 w-4" />
        </Button>
      );
    })}
  </div>
);

const SizeSlider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <Label className="text-sm">{label}</Label>
      <span className="text-xs font-mono text-muted-foreground">{value}px</span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={1}
      onValueChange={(v) => onChange(v[0])}
    />
  </div>
);

const InvoiceStyleEditor: React.FC<Props> = ({ style, onChange }) => {
  const s: InvoiceStyleOptions = { ...DEFAULT_STYLE_OPTIONS, ...style };
  const update = <K extends keyof InvoiceStyleOptions>(key: K, value: InvoiceStyleOptions[K]) =>
    onChange({ ...s, [key]: value });

  return (
    <div className="space-y-6">
      {/* Typographie */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Tailles de police</CardTitle>
          </div>
          <CardDescription>Ajustez chaque taille indépendamment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SizeSlider label='Titre "FACTURE"' value={s.font_size_title} min={12} max={48} onChange={(v) => update('font_size_title', v)} />
          <SizeSlider label="Nom de l'entreprise" value={s.font_size_company} min={12} max={40} onChange={(v) => update('font_size_company', v)} />
          <SizeSlider label="Texte principal" value={s.font_size_body} min={9} max={20} onChange={(v) => update('font_size_body', v)} />
          <SizeSlider label="Texte secondaire (méta)" value={s.font_size_small} min={8} max={16} onChange={(v) => update('font_size_small', v)} />
          <SizeSlider label="Total" value={s.font_size_total} min={12} max={36} onChange={(v) => update('font_size_total', v)} />
          <SizeSlider label="Espacement entre sections" value={s.section_spacing} min={8} max={48} onChange={(v) => update('section_spacing', v)} />
        </CardContent>
      </Card>

      {/* Format date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Format de date</CardTitle>
          <CardDescription>Format officiel par défaut : DD-MM-YY</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={s.date_format} onValueChange={(v) => update('date_format', v as DateFormat)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD-MM-YY">DD-MM-YY (officiel)</SelectItem>
              <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
              <SelectItem value="long-fr">Long français (01 janvier 2025)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Couleurs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Couleurs</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Couleur du texte</Label>
            <div className="flex gap-2">
              <Input type="color" value={s.text_color} onChange={(e) => update('text_color', e.target.value)} className="w-20 h-10" />
              <Input value={s.text_color} onChange={(e) => update('text_color', e.target.value)} className="flex-1" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Couleur d'accent (lignes, bordures)</Label>
            <div className="flex gap-2">
              <Input type="color" value={s.accent_color} onChange={(e) => update('accent_color', e.target.value)} className="w-20 h-10" />
              <Input value={s.accent_color} onChange={(e) => update('accent_color', e.target.value)} className="flex-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alignements */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alignements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>En-tête entreprise</Label>
            <AlignButtons value={s.company_align} onChange={(v) => update('company_align', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Titre facture</Label>
            <AlignButtons value={s.header_align} onChange={(v) => update('header_align', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Total</Label>
            <AlignButtons value={s.total_align} onChange={(v) => update('total_align', v)} />
          </div>
        </CardContent>
      </Card>

      {/* Gras / Italique / Majuscules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Style des sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Titre en gras</Label>
            <Switch checked={s.title_bold} onCheckedChange={(v) => update('title_bold', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Titre en italique</Label>
            <Switch checked={s.title_italic} onCheckedChange={(v) => update('title_italic', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Titre en MAJUSCULES</Label>
            <Switch checked={s.uppercase_title} onCheckedChange={(v) => update('uppercase_title', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Nom entreprise en gras</Label>
            <Switch checked={s.company_bold} onCheckedChange={(v) => update('company_bold', v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Total en gras</Label>
            <Switch checked={s.total_bold} onCheckedChange={(v) => update('total_bold', v)} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvoiceStyleEditor;
