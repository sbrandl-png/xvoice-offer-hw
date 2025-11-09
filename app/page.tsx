"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, Download, Mail, ShoppingCart, Copy, Eye, Trash2 } from "lucide-react";

/**
 * XVOICE HARDWARE OFFER BUILDER – Hardware-only
 * - Nur einmalige Positionen (Hardware)
 * - Rabatt je Position (Default Cap 10%) – gleich breite Inputs für Menge & Rabatt
 * - Angebots-HTML mit Listen- vs. Angebotspreis und klaren Summenzeilen (rechtsbündig)
 * - Stabile Preview, Download, Copy, optionaler Versand über /api/send-offer
 */

// ===== BRAND / COMPANY =====
const BRAND = {
  name: "xVoice UC",
  primary: "#ff4e00",
  dark: "#111111",
  headerBg: "#000000",
  headerFg: "#ffffff",
  logoUrl: "https://onecdn.io/media/b7399880-ec13-4366-a907-6ea635172076/md2x",
};

const COMPANY = {
  legal: "xVoice UC UG (Haftungsbeschränkt)",
  street: "Peter-Müller-Straße 3",
  zip: "40468",
  city: "Düsseldorf",
  phone: "+49 211 955 861 0",
  email: "vertrieb@xvoice-uc.de",
  web: "www.xvoice-uc.de",
  register: "Amtsgericht Siegburg, HRB 19078",
};

// ===== TYPES =====
type CatalogItem = {
  sku: string;
  name: string;
  price: number; // Listenpreis netto
  unit?: string; // "Stück" | "Set" | ...
  desc?: string;
  billing: "one-time";
  maxDiscountPct?: number; // Cap je Position (Standard 10)
};

type Customer = {
  salutation: "Herr" | "Frau" | "";
  company: string;
  contact: string;
  email: string;
  phone: string;
  street: string;
  zip: string;
  city: string;
  notes: string;
};

type Salesperson = {
  name: string;
  email: string;
  phone: string;
};

// ===== HARDWARE-KATALOG (anpassbar) =====
const HARDWARE_MAX_DEFAULT = 10;

const HARDWARE: CatalogItem[] = [
  // Yealink T5x
  { sku: "YEA-T54W",     name: "Yealink T54W IP-Telefon",      price: 149.0, billing: "one-time", unit: "Stück", desc: "GigE, USB, BT, Wi-Fi", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-T57W",     name: "Yealink T57W IP-Telefon",      price: 229.0, billing: "one-time", unit: "Stück", desc: "GigE, USB, BT, Wi-Fi", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-T58W",     name: "Yealink T58W IP-Telefon",      price: 259.0, billing: "one-time", unit: "Stück", desc: "GigE, USB, BT, Wi-Fi", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-T58W-PRO", name: "Yealink T58W Pro IP-Telefon",  price: 289.0, billing: "one-time", unit: "Stück", desc: "GigE, USB, BT, Wi-Fi, schnurloser Hörer", maxDiscountPct: HARDWARE_MAX_DEFAULT },

  // Yealink DECT
  { sku: "YEA-W73P", name: "Yealink W73P DECT-Basis + Hörer", price: 109.0, billing: "one-time", unit: "Set",   desc: "Mobilteil inkl. Basis", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W74P", name: "Yealink W74P DECT-Basis + Hörer", price: 129.0, billing: "one-time", unit: "Set",   desc: "Mobilteil inkl. Basis", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W78P", name: "Yealink W78P DECT-Basis + Hörer", price: 149.0, billing: "one-time", unit: "Set",   desc: "Mobilteil inkl. Basis", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W73H", name: "Yealink W73H Handset",            price:  69.0, billing: "one-time", unit: "Stück", desc: "Mobilteil inkl. Ladeschale", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W74H", name: "Yealink W74H Handset",            price:  89.0, billing: "one-time", unit: "Stück", desc: "Mobilteil inkl. Ladeschale", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W78H", name: "Yealink W78H Handset",            price:  99.0, billing: "one-time", unit: "Stück", desc: "Mobilteil inkl. Ladeschale", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W90DM", name: "Yealink W90 DECT Manager",       price: 249.0, billing: "one-time", unit: "Stück", desc: "DECT-Multizellen-Manager", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-W90B",  name: "Yealink W90 DECT Base Station",  price: 249.0, billing: "one-time", unit: "Stück", desc: "Multizellen-Basisstation (benötigt Manager)", maxDiscountPct: HARDWARE_MAX_DEFAULT },

  // Headsets
  { sku: "YEA-WH64M", name: "Yealink WH64 mono Headset",          price: 149.0, billing: "one-time", unit: "Stück", desc: "Monaurales Business-Headset", maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-WH64D", name: "Yealink WH64 duo Headset",           price: 159.0, billing: "one-time", unit: "Stück", desc: "Biaurales Business-Headset",  maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "YEA-WH68D", name: "Yealink WH68 duo hybrid Headset",    price: 159.0, billing: "one-time", unit: "Stück", desc: "Premium Business-Headset",    maxDiscountPct: HARDWARE_MAX_DEFAULT },

  // Gigaset D-Serie
  { sku: "GIG-D810",  name: "Gigaset D810 IP Pro",  price:  99.0, billing: "one-time", unit: "Stück", desc: "IP-Tischtelefon mit 3,36″ TFT-Display",                         maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "GIG-D820",  name: "Gigaset D820 IP Pro",  price: 119.0, billing: "one-time", unit: "Stück", desc: "IP-Tischtelefon mit 5″ TFT-Display",                            maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "GIG-D825",  name: "Gigaset D825 IP Pro",  price: 129.0, billing: "one-time", unit: "Stück", desc: "IP-Tischtelefon mit 5″ TFT-Display",                            maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "GIG-D850W", name: "Gigaset D850W IP Pro", price: 139.0, billing: "one-time", unit: "Stück", desc: "IP-Tischtelefon mit 5″ TFT-Display und WLAN",                   maxDiscountPct: HARDWARE_MAX_DEFAULT },
  { sku: "GIG-P800KP",name: "Gigaset P800 Key Pro Tastenmodul", price: 119.0, billing: "one-time", unit: "Stück", desc: "Erweiterungsmodul mit 20 physischen Tasten", maxDiscountPct: HARDWARE_MAX_DEFAULT },
];

// ===== ENDPOINTS =====
const EMAIL_ENDPOINT = "/api/send-offer";

// ===== UTILS =====
function formatMoney(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
function escapeHtml(str: string) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function fullCustomerAddress(c: Customer) {
  const lines = [
    c.company || "",
    c.contact || "",
    c.street || "",
    [c.zip, c.city].filter(Boolean).join(" "),
    c.email || "",
    c.phone || "",
  ].filter(Boolean);
  return lines.join("\n");
}
function greetingLine(c: Customer) {
  const name = (c.contact || "").trim();
  if (!name) return "Guten Tag,";
  return c.salutation === "Frau" ? `Sehr geehrte Frau ${name},` : `Sehr geehrter Herr ${name},`;
}

// ===== EMAIL HTML (nur EINMALIG) =====
type BuiltRow = {
  sku: string;
  name: string;
  desc?: string;
  quantity: number;
  listUnit: number;
  offerUnit: number;
  listTotal: number;
  offerTotal: number;
  badgePct: number;
};

function buildEmailHtml(params: {
  customer: Customer;
  salesperson: Salesperson;
  rows: BuiltRow[];
  vatRate: number;
}) {
  const { customer, salesperson, rows, vatRate } = params;

  const s = {
    body: "margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;color:#111",
    container: "max-width:720px;margin:0 auto;padding:24px",
    card: "background:#ffffff;border-radius:14px;padding:0;border:1px solid #e9e9ef;overflow:hidden",
    header: `background:${BRAND.headerBg};color:${BRAND.headerFg};padding:16px 20px;`,
    headerTable: "width:100%;border-collapse:collapse",
    logo: "display:block;height:64px;object-fit:contain",
    accent: `height:3px;background:${BRAND.primary};`,
    inner: "padding:20px",
    h1: `margin:0 0 8px 0;font-size:22px;color:${BRAND.dark}`,
    h3: `margin:0 0 8px 0;font-size:16px;color:${BRAND.dark}`,
    p: "margin:0 0 10px 0;font-size:14px;color:#333;line-height:1.6",
    pSmall: "margin:0 0 8px 0;font-size:12px;color:#666;line-height:1.5",
    th: "text-align:left;padding:10px 8px;font-size:12px;border-bottom:1px solid #eee;color:#555;white-space:nowrap",
    td: "padding:10px 8px;font-size:13px;border-bottom:1px solid #f1f1f5;vertical-align:top",
    totalLabel: "padding:8px 8px;font-size:13px;white-space:nowrap;width:260px;text-align:right",
    totalValue: "padding:8px 8px;font-size:13px;text-align:right",
    priceList: "display:inline-block;text-decoration:line-through;opacity:.6;margin-right:8px",
    priceOffer: `display:inline-block;color:${BRAND.primary};font-weight:bold`,
    badge: `display:inline-block;background:${BRAND.primary};color:#fff;border-radius:999px;padding:2px 8px;font-size:11px;margin-left:8px;vertical-align:middle`,
    btn: `display:inline-block;background:${BRAND.primary};color:${BRAND.headerFg};text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold`,
    btnGhost: "display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:bold",
    hrOrange: `height:3px;background:${BRAND.primary};border:none;margin:16px 0`,
    addressBox: "background:#f2f3f7;border-radius:6px;padding:10px 14px;margin-top:12px;margin-bottom:18px;line-height:1.55;font-size:13px;color:#333;",
  };

  function rowsHtml(list: BuiltRow[]) {
    return list
      .map(
        (li) => `
      <tr>
        <td style="${s.td}">
          <strong>${escapeHtml(li.name)}</strong>
          ${li.desc ? `<div style="${s.pSmall}">${escapeHtml(li.desc)}</div>` : ""}
          <div style="${s.pSmall}">${li.sku}</div>
        </td>
        <td style="${s.td}">${li.quantity}</td>
        <td style="${s.td}">
          ${
            li.badgePct > 0
              ? `<span style="${s.priceList}">${formatMoney(li.listUnit)}</span>
                 <span style="${s.priceOffer}">${formatMoney(li.offerUnit)}</span>
                 <span style="${s.badge}">-${li.badgePct}%</span>`
              : `<span>${formatMoney(li.offerUnit)}</span>`
          }
        </td>
        <td style="${s.td}">
          ${
            li.badgePct > 0
              ? `<span style="${s.priceList}">${formatMoney(li.listTotal)}</span>
                 <strong>${formatMoney(li.offerTotal)}</strong>`
              : `<strong>${formatMoney(li.offerTotal)}</strong>`
          }
        </td>
      </tr>`
      )
      .join("");
  }

  function totalsSection(list: BuiltRow[]) {
    const listSubtotal = list.reduce((a, r) => a + r.listTotal, 0);
    const offerSubtotal = list.reduce((a, r) => a + r.offerTotal, 0);
    const discount = Math.max(0, listSubtotal - offerSubtotal);
    const vat = offerSubtotal * vatRate;
    const gross = offerSubtotal + vat;
    return `
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}">Listen-Zwischensumme (netto)</td>
        <td style="${s.totalValue}"><strong>${formatMoney(listSubtotal)}</strong></td>
      </tr>
      ${
        discount > 0
          ? `
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}">Rabatt gesamt</td>
        <td style="${s.totalValue}"><strong>−${formatMoney(discount)}</strong></td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}">Zwischensumme nach Rabatt</td>
        <td style="${s.totalValue}"><strong>${formatMoney(offerSubtotal)}</strong></td>
      </tr>`
          : `
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}">Zwischensumme (netto)</td>
        <td style="${s.totalValue}"><strong>${formatMoney(offerSubtotal)}</strong></td>
      </tr>`
      }
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}">zzgl. USt. (19%)</td>
        <td style="${s.totalValue}"><strong>${formatMoney(vat)}</strong></td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td style="${s.totalLabel}"><strong>Bruttosumme</strong></td>
        <td style="${s.totalValue}"><strong>${formatMoney(gross)}</strong></td>
      </tr>
    `;
  }

  const addressCustomer = fullCustomerAddress(customer);

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charSet="utf-8"/></head>
<body style="${s.body}">
  <div style="${s.container}">
    <div style="${s.card}">
      <div style="${s.header}">
        <table style="${s.headerTable}">
          <tr>
            <td><img src="${BRAND.logoUrl}" alt="xVoice Logo" style="${s.logo}" /></td>
            <td style="text-align:right"><p style="${s.pSmall}">${COMPANY.web} · ${COMPANY.email} · ${COMPANY.phone}</p></td>
          </tr>
        </table>
      </div>
      <div style="${s.accent}"></div>
      <div style="${s.inner}">
        <h2 style="${s.h1}">Ihr individuelles Hardware-Angebot</h2>
        ${customer.company ? `<p style="${s.p}"><strong>${escapeHtml(customer.company)}</strong></p>` : `<p style="${s.p}"><strong>Firma unbekannt</strong></p>`}
        ${addressCustomer ? `<div style="${s.addressBox}">${escapeHtml(addressCustomer).replace(/\n/g, "<br>")}</div>` : ""}
        <p style="${s.p}">${escapeHtml(greetingLine(customer))}</p>

        <p style="${s.p}">vielen Dank für Ihr Interesse an xVoice UC. Unsere Hardwareempfehlung haben wir nach Ihren Anforderungen zusammengestellt.</p>
        <p style="${s.p}">Gerne bespreche ich die nächsten Schritte mit Ihnen – telefonisch oder per Teams-Call, ganz wie es Ihnen am besten passt.</p>

        <!-- EINMALIGE POSITIONEN -->
        <h3 style="${s.h3};margin-top:8px">Einmalige Positionen</h3>
        <table width="100%" style="border-collapse:collapse;margin-top:6px">
          <thead>
            <tr>
              <th style="${s.th}">Position</th>
              <th style="${s.th}">Menge</th>
              <th style="${s.th}">Einzelpreis</th>
              <th style="${s.th}">Summe</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml(rows)}
            ${totalsSection(rows)}
          </tbody>
        </table>

        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap">
          <a href="mailto:orders@xvoice-uc.de?subject=Hardware-Bestellung&body=Ich%20bestelle%20gem%C3%A4%C3%9F%20Angebot." style="${s.btn}">Jetzt bestellen</a>
          <a href="https://calendly.com/s-brandl-xvoice-uc/ruckfragen-zum-angebot" target="_blank" rel="noopener" style="${s.btnGhost}">Rückfrage zum Angebot</a>
        </div>

        <!-- Vertriebsgruß -->
        <div style="margin-top:18px;border-top:1px solid #eee;padding-top:12px">
          <p style="${s.p}">Mit freundlichen Grüßen</p>
          ${salesperson.name ? `<p style="${s.p}"><strong>${escapeHtml(salesperson.name)}</strong></p>` : ""}
          ${salesperson.phone ? `<p style="${s.pSmall}">Tel. ${escapeHtml(salesperson.phone)}</p>` : ""}
          ${salesperson.email ? `<p style="${s.pSmall}">${escapeHtml(salesperson.email)}</p>` : ""}
        </div>

        <!-- Orange Linie über CEO-Block -->
        <hr style="${s.hrOrange}" />

        <!-- CEO-Block -->
        <div style="margin-top:0;border-top:1px solid #eee;padding-top:14px;">
          <table width="100%" style="border-collapse:collapse">
            <tr>
              <td style="width:120px;vertical-align:top">
                <img src="https://onecdn.io/media/10febcbf-6c57-4af7-a0c4-810500fea565/full" alt="Sebastian Brandl" style="width:100%;max-width:120px;border:1px solid #eee;border-radius:0;display:block" />
              </td>
              <td style="vertical-align:top;padding-left:20px">
                <p style="${s.p}"><em>„Unser Ziel ist es, Kommunikation für Ihr Team spürbar einfacher zu machen – ohne Kompromisse bei Sicherheit und Service.“</em></p>
                <img src="https://onecdn.io/media/b96f734e-465e-4679-ac1b-1c093a629530/full" alt="Unterschrift Sebastian Brandl" style="width:160px;margin-top:8px;display:block" />
                <p style="${s.p}"><strong>Sebastian Brandl</strong> · Geschäftsführer</p>
              </td>
            </tr>
          </table>
        </div>

        <p style="${s.pSmall};margin-top:16px">Alle Preise in EUR netto zzgl. gesetzlicher Umsatzsteuer. Änderungen und Irrtümer vorbehalten.</p>

        <!-- Firmenfooter -->
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #eee">
          <p style="${s.pSmall}">${COMPANY.legal}</p>
          <p style="${s.pSmall}">${COMPANY.street}, ${COMPANY.zip} ${COMPANY.city}</p>
          <p style="${s.pSmall}">Tel. ${COMPANY.phone} · ${COMPANY.email} · ${COMPANY.web}</p>
          <p style="${s.pSmall}">${COMPANY.register}</p>
          <p style="${s.pSmall}">© ${new Date().getFullYear()} xVoice UC · Impressum & Datenschutz auf xvoice-uc.de</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ===== SMALL UI PARTS =====
function Header() {
  return (
    <div
      className="flex items-center justify-between gap-4 p-6 rounded-2xl shadow-sm"
      style={{ background: BRAND.headerBg, color: BRAND.headerFg }}
    >
      <div className="flex items-center gap-6">
        <img
          src={BRAND.logoUrl}
          alt="xVoice Logo"
          className="h-24 w-24 object-contain" // größer
        />
        <div>
          <div className="text-2xl font-semibold" style={{ color: BRAND.headerFg }} />
          <div className="text-sm opacity-80" style={{ color: BRAND.headerFg }}>
            Hardware-Angebots-Konfigurator
          </div>
        </div>
      </div>
      <div className="text-sm" style={{ color: "#d1d5db" }}>
        Stand {todayIso()}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  action,
}: React.PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: BRAND.dark }}>
            {title}
          </h2>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ProductRow({
  item,
  qty,
  onQty,
  discountPct,
  onDiscountPct,
  helper,
  cap,
}: {
  item: CatalogItem;
  qty: number;
  onQty: (v: number) => void;
  discountPct: number;
  onDiscountPct: (v: number) => void;
  helper?: string;
  cap: number;
}) {
  const pctCapped = Math.max(0, Math.min(cap, isFinite(discountPct) ? discountPct : 0));
  const unitAfter = item.price * (1 - pctCapped / 100);

  return (
    <div className="grid grid-cols-[minmax(260px,1fr)_120px_260px_140px] items-start gap-4 py-3 border-b last:border-none">
      <div>
        <div className="font-medium">{item.name}</div>
        <div className="text-xs text-muted-foreground">
          {item.sku} {item.desc ? `· ${item.desc}` : ""}
        </div>
      </div>

      <div className="text-sm font-medium tabular-nums">
        {formatMoney(item.price)}
        {pctCapped > 0 && (
          <div className="text-xs">
            <span className="line-through opacity-60 mr-1">{formatMoney(item.price)}</span>
            <span className="font-semibold" style={{ color: BRAND.primary }}>
              {formatMoney(unitAfter)}
            </span>
            <span
              className="ml-2 px-2 py-[2px] rounded-full text-[11px] text-white"
              style={{ background: BRAND.primary }}
            >
              -{pctCapped}%
            </span>
          </div>
        )}
      </div>

      {/* Menge & Rabatt: identische Breite (w-28) */}
      <div className="grid grid-cols-2 gap-3 items-center">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            step={1}
            value={qty}
            onChange={(e) => onQty(Math.max(0, Math.floor(Number(e.target.value || 0))))}
            className="w-28"
          />
          <span className="text-xs text-muted-foreground">{item.unit || ""}</span>
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={cap}
            step={0.5}
            value={pctCapped}
            onChange={(e) =>
              onDiscountPct(Math.max(0, Math.min(cap, Number(e.target.value || 0))))
            }
            className="w-28"
          />
          <span className="text-xs text-muted-foreground">max {cap}%</span>
        </div>
      </div>

      <div className="text-right font-semibold tabular-nums">
        {formatMoney(unitAfter * qty)}
      </div>

      {helper ? (
        <div className="col-span-4 -mt-2 text-xs text-muted-foreground">{helper}</div>
      ) : null}
    </div>
  );
}

function Totals({ rows, vatRate }: { rows: { listTotal: number; offerTotal: number }[]; vatRate: number }) {
  const listSubtotal = rows.reduce((a, r) => a + r.listTotal, 0);
  const offerSubtotal = rows.reduce((a, r) => a + r.offerTotal, 0);
  const discount = Math.max(0, listSubtotal - offerSubtotal);
  const vat = offerSubtotal * vatRate;
  const gross = offerSubtotal + vat;

  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-8">
      <span className={strong ? "font-semibold" : undefined}>{label}</span>
      <span className={"tabular-nums text-right " + (strong ? "font-semibold" : "")}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-1 text-sm">
      <Row label="Listen-Zwischensumme (netto)" value={formatMoney(listSubtotal)} />
      {discount > 0 && <Row label="Rabatt gesamt" value={"−" + formatMoney(discount)} />}
      <Row label={discount > 0 ? "Zwischensumme nach Rabatt" : "Zwischensumme (netto)"} value={formatMoney(offerSubtotal)} />
      <Row label="zzgl. USt. (19%)" value={formatMoney(vat)} />
      <Row label="Bruttosumme" value={formatMoney(gross)} strong />
    </div>
  );
}

// ===== PAGE =====
export default function Page() {
  const [vatRate] = useState(0.19);

  // Mengen & Rabatte
  const [qty, setQty] = useState<Record<string, number>>(Object.fromEntries(HARDWARE.map(p => [p.sku, 0])));
  const [discPct, setDiscPct] = useState<Record<string, number>>(Object.fromEntries(HARDWARE.map(p => [p.sku, 0])));

  // Kunde / Vertrieb
  const [customer, setCustomer] = useState<Customer>({
    salutation: "",
    company: "",
    contact: "",
    email: "",
    phone: "",
    street: "",
    zip: "",
    city: "",
    notes: "",
  });
  const [salesperson, setSalesperson] = useState<Salesperson>({ name: "", email: "vertrieb@xvoice-uc.de", phone: "" });
  const [salesEmail, setSalesEmail] = useState("vertrieb@xvoice-uc.de");
  const [subject, setSubject] = useState("Ihr individuelles xVoice UC Hardware-Angebot");

  // Zeilen bauen
  const oneTimeRows: BuiltRow[] = useMemo(() => {
    const rows: BuiltRow[] = [];
    for (const p of HARDWARE) {
      const q = qty[p.sku] || 0;
      if (q <= 0) continue;
      const cap = p.maxDiscountPct ?? HARDWARE_MAX_DEFAULT;
      const pct = Math.max(0, Math.min(cap, discPct[p.sku] || 0));
      const listUnit = p.price;
      const offerUnit = p.price * (pct ? (1 - pct / 100) : 1);
      const listTotal = listUnit * q;
      const offerTotal = offerUnit * q;
      const badgePct = listUnit > 0 ? Math.round((1 - offerUnit / listUnit) * 100) : 0;

      rows.push({
        sku: p.sku,
        name: p.name,
        desc: p.desc,
        quantity: q,
        listUnit,
        offerUnit,
        listTotal,
        offerTotal,
        badgePct: Math.max(0, Math.min(100, badgePct)),
      });
    }
    return rows;
  }, [qty, discPct]);

  // HTML
  const offerHtml = useMemo(
    () =>
      buildEmailHtml({
        customer,
        salesperson,
        rows: oneTimeRows,
        vatRate,
      }),
    [customer, salesperson, oneTimeRows, vatRate]
  );

  // UX
  const [sending, setSending] = useState(false);
  const [sendOk, setSendOk] = useState(false);
  const [error, setError] = useState("");
  const [copyOk, setCopyOk] = useState(false);
  const [copyError, setCopyError] = useState("");

  // Actions
  function openPreviewNewTab() {
    try {
      const blob = new Blob([offerHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const w = window.open(url, "_blank", "noopener");
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch {}
      }, 5000);
      if (w) return;
    } catch {}
    try {
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(offerHtml);
      window.open(dataUrl, "_blank", "noopener");
    } catch (err) {
      setError("Vorschau blockiert: " + String(err));
    }
  }

  function handleDownloadHtml() {
    try {
      const blob = new Blob([offerHtml], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xvoice_hardware_angebot_${todayIso()}.html`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => {
        try { URL.revokeObjectURL(url); } catch {}
      }, 0);
      return;
    } catch {}
    try {
      const a = document.createElement("a");
      a.href = "data:text/html;charset=utf-8," + encodeURIComponent(offerHtml);
      a.download = `xvoice_hardware_angebot_${todayIso()}.html`;
      a.target = "_blank";
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setError("Download blockiert: " + String(err));
    }
  }

  async function safeCopyToClipboard(text: string): Promise<{ ok: boolean; via?: string; error?: any }> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return { ok: true, via: "clipboard" };
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return { ok: !!ok, via: "execCommand" };
    } catch (error) {
      return { ok: false, via: "blocked", error };
    }
  }

  async function postJson(url: string, payload: any) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json().catch(() => ({}));
    } catch (err: any) {
      const msg = String(err?.message || err || "");
      if (/UnsupportedHttpVerb|405|method not allowed/i.test(msg)) {
        const minimal = {
          subject: payload?.meta?.subject || "xVoice Hardware-Angebot",
          to: (payload?.recipients || []).join(","),
          company: payload?.customer?.company || "",
        };
        const qs = new URLSearchParams({ data: JSON.stringify(minimal) }).toString();
        const res2 = await fetch(`${url}?${qs}`, { method: "GET" });
        if (!res2.ok) throw new Error(await res2.text());
        return res2.json().catch(() => ({}));
      }
      throw err;
    }
  }

  async function handleSendEmail() {
    setSending(true);
    setError("");
    setSendOk(false);
    try {
      const netList = oneTimeRows.reduce((a, r) => a + r.listTotal, 0);
      const netOffer = oneTimeRows.reduce((a, r) => a + r.offerTotal, 0);
      await postJson(EMAIL_ENDPOINT, {
        meta: { subject },
        offerHtml,
        customer,
        oneTimeRows,
        totals: {
          oneTime: { netList, netOffer, vat: netOffer * vatRate, gross: netOffer * (1 + vatRate) },
        },
        salesperson,
        recipients: [customer.email, salesEmail].filter(Boolean),
      });
      setSendOk(true);
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setSending(false);
    }
  }

  function resetAll() {
    setQty(Object.fromEntries(HARDWARE.map((p) => [p.sku, 0])));
    setDiscPct(Object.fromEntries(HARDWARE.map((p) => [p.sku, 0])));
    setCustomer({ salutation: "", company: "", contact: "", email: "", phone: "", street: "", zip: "", city: "", notes: "" });
    setSalesperson({ name: "", email: "vertrieb@xvoice-uc.de", phone: "" });
    setSendOk(false);
    setError("");
    setCopyOk(false);
    setCopyError("");
  }

  // ===== UI =====
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Header />

      {/* 1. Hardware (einmalig) */}
      <Section title="Hardware (einmalig)" action={<div className="text-xs opacity-70">USt. fest: 19%</div>}>
        <div className="grid grid-cols-1 gap-2">
          <div className="grid grid-cols-[minmax(260px,1fr)_120px_260px_140px] gap-4 text-xs uppercase text-muted-foreground pb-2 border-b">
            <div>Produkt</div>
            <div>Listenpreis</div>
            <div>Menge & Rabatt</div>
            <div className="text-right">Summe</div>
          </div>

          {HARDWARE.map((item) => {
            const q = qty[item.sku] || 0;
            const onQ = (v: number) => setQty((prev) => ({ ...prev, [item.sku]: Math.max(0, Math.floor(v)) }));
            const cap = item.maxDiscountPct ?? HARDWARE_MAX_DEFAULT;
            const onD = (v: number) => setDiscPct((prev) => ({ ...prev, [item.sku]: Math.max(0, Math.min(cap, v)) }));

            return (
              <ProductRow
                key={item.sku}
                item={item}
                qty={q}
                onQty={onQ}
                discountPct={discPct[item.sku] || 0}
                onDiscountPct={onD}
                cap={cap}
              />
            );
          })}
        </div>

        <div className="mt-4 flex items-start justify-between gap-6">
          <div className="text-xs opacity-80">
            Alle Preise netto zzgl. der gültigen USt. Angaben ohne Gewähr. Änderungen vorbehalten.
          </div>
          <Totals
            rows={(() => {
              const rows = [];
              for (const p of HARDWARE) {
                const q = qty[p.sku] || 0;
                if (q <= 0) continue;
                const cap = p.maxDiscountPct ?? HARDWARE_MAX_DEFAULT;
                const pct = Math.max(0, Math.min(cap, discPct[p.sku] || 0));
                const listUnit = p.price;
                const offerUnit = p.price * (pct ? (1 - pct / 100) : 1);
                rows.push({ listTotal: listUnit * q, offerTotal: offerUnit * q });
              }
              return rows;
            })()}
            vatRate={vatRate}
          />
        </div>
      </Section>

      {/* 2. Kundendaten & Versand */}
      <Section title="Kundendaten & Versand">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-sm w-20">Anrede</Label>
            <select
              className="border rounded-md h-10 px-3 text-sm"
              value={customer.salutation}
              onChange={(e) => setCustomer({ ...customer, salutation: e.target.value as Customer["salutation"] })}
            >
              <option value="">–</option>
              <option value="Herr">Herr</option>
              <option value="Frau">Frau</option>
            </select>
          </div>
          <Input placeholder="Ansprechpartner" value={customer.contact} onChange={(e) => setCustomer({ ...customer, contact: e.target.value })} />
          <Input placeholder="Firma" value={customer.company} onChange={(e) => setCustomer({ ...customer, company: e.target.value })} />
          <Input placeholder="E-Mail Kunde" type="email" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          <Input placeholder="Telefon" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          <Input placeholder="Straße & Nr." value={customer.street} onChange={(e) => setCustomer({ ...customer, street: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="PLZ" value={customer.zip} onChange={(e) => setCustomer({ ...customer, zip: e.target.value })} />
            <Input placeholder="Ort" value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Textarea placeholder="Interne Notizen (optional)" value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input placeholder="Name Vertriebsmitarbeiter" value={salesperson.name} onChange={(e) => setSalesperson({ ...salesperson, name: e.target.value })} />
            <Input placeholder="E-Mail Vertrieb" type="email" value={salesperson.email} onChange={(e) => setSalesperson({ ...salesperson, email: e.target.value })} />
            <Input placeholder="Telefon Vertrieb" value={salesperson.phone} onChange={(e) => setSalesperson({ ...salesperson, phone: e.target.value })} />
          </div>
          <Input placeholder="Betreff" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2 flex items-center gap-2">
            <Label className="text-sm">Vertrieb E-Mail (Kopie)</Label>
            <Input placeholder="vertrieb@xvoice-uc.de" type="email" value={salesEmail} onChange={(e) => setSalesEmail(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <Button onClick={openPreviewNewTab} variant="secondary" className="gap-2">
            <Eye size={16} /> Vorschau (neuer Tab)
          </Button>
          <Button
            onClick={async () => {
              setCopyOk(false);
              setCopyError("");
              const r = await safeCopyToClipboard(offerHtml);
              if (r.ok) setCopyOk(true);
              else {
                setCopyError("Kopieren blockiert. HTML wird stattdessen heruntergeladen.");
                handleDownloadHtml();
              }
            }}
            className="gap-2"
            style={{ backgroundColor: BRAND.primary }}
          >
            <Copy size={16} /> HTML kopieren
          </Button>
          <Button onClick={handleDownloadHtml} className="gap-2" variant="outline">
            <Download size={16} /> HTML herunterladen
          </Button>
          <Button onClick={handleSendEmail} disabled={sending} className="gap-2" style={{ backgroundColor: BRAND.primary }}>
            <Mail size={16} /> Angebot per Mail senden
          </Button>
          <Button onClick={resetAll} variant="ghost" className="gap-2 text-red-600">
            <Trash2 size={16} /> Zurücksetzen
          </Button>
        </div>

        {sendOk && <div className="mt-3 flex items-center gap-2 text-green-700 text-sm"><Check size={16} /> Erfolgreich übermittelt.</div>}
        {!!error && <div className="mt-3 text-red-600 text-sm">Fehler: {error}</div>}
        {copyOk && <div className="mt-3 text-green-700 text-sm">HTML in die Zwischenablage kopiert.</div>}
        {!!copyError && <div className="mt-3 text-amber-600 text-sm">{copyError}</div>}
      </Section>

      {/* Live-Zusammenfassung */}
      <Section title="Live-Zusammenfassung">
        {oneTimeRows.length === 0 ? (
          <div className="text-sm opacity-70">Keine Positionen gewählt.</div>
        ) : (
          <div className="space-y-2">
            {oneTimeRows.map((li) => (
              <div key={li.sku} className="flex justify-between text-sm">
                <div>
                  {li.quantity}× {li.name} ({li.sku})
                </div>
                <div className="tabular-nums">{formatMoney(li.offerTotal)}</div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Totals
                rows={oneTimeRows.map((r) => ({ listTotal: r.listTotal, offerTotal: r.offerTotal }))}
                vatRate={vatRate}
              />
            </div>
          </div>
        )}
      </Section>

      <footer className="text-xs text-center opacity-70 pt-2">
        © {new Date().getFullYear()} xVoice UC · Hardware-Angebot · Alle Angaben ohne Gewähr
      </footer>
    </div>
  );
}
