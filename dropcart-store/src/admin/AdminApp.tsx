import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  AlertTriangle, ArrowRight, BarChart3, Check, ChevronDown, Clock3, Copy, Database, Download, Eye, IndianRupee,
  ImagePlus, LayoutDashboard, LockKeyhole, Menu, Package, Pencil, Percent, Plus, RefreshCcw, Repeat, Search,
  ShoppingBag, Sparkles, Tag, Trash2, TrendingDown, TrendingUp, Users, X,
} from "lucide-react";
import {
  type Product, type ProductInput, type ProductUpdate,
  useCreateProduct, useDeleteProduct, useListProducts, useUpdateProduct, getListProductsQueryKey,
} from "@workspace/api-client-react";
import "./admin.css";


function ProductEditor({ product, onClose }: { product?: Product; onClose: () => void }) {
  const queryClient = useQueryClient();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [form, setForm] = useState<ProductInput>({
    name: product?.name ?? "",
    category: product?.category ?? "General",
    description: product?.description ?? "",
    price: product?.price ?? 999,
    compareAtPrice: product?.compareAtPrice ?? 1499,
    rating: product?.rating ?? 4.5,
    reviewCount: product?.reviewCount ?? 0,
    stock: product?.stock ?? 20,
    images: product?.images ?? ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85"],
    highlights: product?.highlights ?? ["Thoughtful everyday design", "Fast delivery", "7-day easy returns"],
  });
  const saving = createProduct.isPending || updateProduct.isPending;
  const updateField = <K extends keyof ProductInput>(key: K, value: ProductInput[K]) => setForm((current) => ({ ...current, [key]: value }));
  const updateImage = (index: number, value: string) => {
    setForm((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) => imageIndex === index ? value : image),
    }));
  };
  const addImage = () => setForm((current) => ({ ...current, images: [...current.images, ""] }));
  const removeImage = (index: number) => setForm((current) => ({
    ...current,
    images: current.images.length > 1 ? current.images.filter((_, imageIndex) => imageIndex !== index) : current.images,
  }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const payload: ProductUpdate = { ...form, images: form.images.filter((image) => image.trim().length > 0) };
    const options = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); onClose(); } };
    if (product) updateProduct.mutate({ productId: product.id, data: payload }, options);
    else createProduct.mutate({ data: { ...form, images: form.images.filter((image) => image.trim().length > 0) } }, options);
  };
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="editor-modal">
        <button className="modal-close" onClick={onClose} aria-label="Close editor"><X size={18} /></button>
        <span className="eyebrow">{product ? "Edit listing" : "New listing"}</span>
        <h2>{product ? "Tune your product." : "Add a new product."}</h2>
        <form onSubmit={submit}>
          <div className="field-grid">
            <label>Product name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Category<input required value={form.category} onChange={(event) => updateField("category", event.target.value)} /></label>
            <label>Price<input required type="number" min="0" value={form.price} onChange={(event) => updateField("price", Number(event.target.value))} /></label>
            <label>Compare at<input required type="number" min="0" value={form.compareAtPrice} onChange={(event) => updateField("compareAtPrice", Number(event.target.value))} /></label>
          </div>
          <label>Description<textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
          <div className="field-grid">
            <label>Stock<input required type="number" min="0" value={form.stock} onChange={(event) => updateField("stock", Number(event.target.value))} /></label>
            <label>Rating<input required type="number" min="0" max="5" step="0.1" value={form.rating} onChange={(event) => updateField("rating", Number(event.target.value))} /></label>
          </div>
          <div className="images-editor">
            <div className="images-editor-heading">
              <div><span className="field-label">Product media</span><small>Add multiple image URLs or GIF URLs. The first item is the main gallery image.</small></div>
              <button type="button" className="secondary-button compact" onClick={addImage}><ImagePlus size={15} /> Add image</button>
            </div>
            {form.images.map((image, index) => (
              <div className="image-editor-row" key={`${index}-${image}`}>
                <span className="image-index">{String(index + 1).padStart(2, "0")}</span>
                <input required={index === 0} value={image} onChange={(event) => updateImage(index, event.target.value)} placeholder="https://.../product-image.jpg or .gif" />
                {image && <img src={image} alt="" />}
                <button type="button" className="image-remove" onClick={() => removeImage(index)} disabled={form.images.length === 1} aria-label={`Remove image ${index + 1}`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
          <div className="editor-actions">
            <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={saving}>{saving ? "Saving..." : "Save listing"} <Check size={16} /></button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminAuthScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error ?? "Unable to sign in");
      }
      onLogin();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setPending(false);
    }
  };

  return <div className="admin-auth-screen"><div className="auth-heading"><span className="brand-mark large"><LockKeyhole size={20} /></span><span className="eyebrow">Restricted workspace</span><h1>Operator sign in</h1><p>Use your admin username and password to manage the storefront, orders, and customer signals.</p><form onSubmit={submit} className="admin-login-form"><label>Username<input required autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Admin username" /></label><label>Password<input required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Admin password" /></label>{error && <span className="form-error">{error}</span>}<button className="primary-button wide" disabled={pending}>{pending ? "Signing in..." : "Sign in"} <ArrowRight size={17} /></button></form><span className="login-foot"><ShieldCheck size={14} /> Protected by BuyDo admin security</span></div></div>;
}

/* =============================== helpers =============================== */
type Kpis = { revenue: number; orders: number; units: number; aov: number; visits: number; clicks: number; conversion: number; clickRate: number; cancelRate: number; customers: number; newCustomers: number; repeatRate: number };
type Analytics = {
  days: number; kpis: Kpis; previous: Kpis;
  today: { revenue: number; orders: number; visits: number; yRevenue: number; yOrders: number };
  series: { date: string; label: string; visits: number; clicks: number; orders: number; revenue: number }[];
  byStatus: { name: string; count: number }[]; byPayment: { name: string; count: number; revenue: number }[];
  topProducts: { productId: string; name: string; units: number; revenue: number }[];
  hourly: { hour: number; label: string; orders: number }[]; weekday: { name: string; orders: number; revenue: number }[];
  topCustomers: { name: string; contact: string; orders: number; spent: number }[];
  funnel: { name: string; value: number }[];
  inventory: { id: string; name: string; stock: number; soldInPeriod: number; perDay: number; daysLeft: number | null }[];
  inventoryValue: number; pendingOrders: number;
  bestDay: { label: string; revenue: number; orders: number } | null; projection: { next7Revenue: number };
};
type AdminOrder = { id: string; productId: string; productName: string; quantity: number; total: number; paymentMethod: string; status: string; deliveryDate: string; createdAt: string; customerName: string; customerContact: string; address: string };
type Customer = { name: string; contact: string; address: string; addresses: string[]; orders: number; spent: number; cancelled: number; firstOrder: string; lastOrder: string; orderIds: string[] };
type DbOverview = { products: number; orders: number; analyticsDays: number; oldestOrder: string | null; newestOrder: string | null; statuses: { status: string; count: number }[]; sizes: { name: string; bytes: number }[] };
type Tab = "overview" | "analytics" | "orders" | "products" | "customers" | "database";

const STATUSES = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const COLORS = ["#6c5ce7", "#00b894", "#fdcb6e", "#0984e3", "#e17055", "#a29bfe"];
const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const num = (n: number) => n.toLocaleString("en-IN");
const dt = (d: string | Date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date(d));
const dOnly = (d: string | Date) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" }).format(new Date(d));
const bytes = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

class AuthError extends Error {}
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: "same-origin", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (res.status === 401) throw new AuthError("Session expired");
  if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error ?? "Request failed");
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

function Delta({ cur, prev, invert }: { cur: number; prev: number; invert?: boolean }) {
  if (!prev) return <span className="bd-delta flat">{cur ? "New" : "—"}</span>;
  const p = ((cur - prev) / prev) * 100;
  const good = invert ? p <= 0 : p >= 0;
  return <span className={`bd-delta ${good ? "up" : "down"}`}>{p >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(p).toFixed(1)}%</span>;
}

function Kpi({ label, value, cur, prev, icon: Icon, spark, invert }: { label: string; value: string; cur: number; prev: number; icon: typeof Eye; spark?: number[]; invert?: boolean }) {
  const data = (spark ?? []).map((v, i) => ({ i, v }));
  return <div className="bd-kpi">
    <div className="bd-kpi-top"><span className="bd-kpi-icon"><Icon size={16} /></span><span>{label}</span></div>
    <strong>{value}</strong>
    <div className="bd-kpi-foot"><Delta cur={cur} prev={prev} invert={invert} /><small>vs previous period</small></div>
    {data.length > 1 && <div className="bd-spark"><ResponsiveContainer width="100%" height={36}><AreaChart data={data}><Area type="monotone" dataKey="v" stroke="#6c5ce7" fill="#6c5ce722" strokeWidth={2} dot={false} isAnimationActive={false} /></AreaChart></ResponsiveContainer></div>}
  </div>;
}

function Card({ title, sub, right, children, className = "" }: { title: string; sub?: string; right?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`bd-card ${className}`}><header><div><h3>{title}</h3>{sub && <small>{sub}</small>}</div>{right}</header>{children}</section>;
}
const Empty = ({ text }: { text: string }) => <div className="bd-empty"><Package size={22} /><span>{text}</span></div>;
const tipStyle = { borderRadius: 10, border: "1px solid #e6e8f2", fontSize: 12 };

function ConfirmModal({ title, text, onClose, onConfirm, busy }: { title: string; text: string; onClose: () => void; onConfirm: () => void; busy: boolean }) {
  const [typed, setTyped] = useState("");
  return <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bd-confirm"><AlertTriangle size={26} color="#e17055" /><h3>{title}</h3><p>{text}</p>
      <p>Confirm karne ke liye <b>DELETE</b> type karo:</p>
      <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="DELETE" autoFocus />
      <div className="bd-row"><button className="secondary-button" onClick={onClose}>Cancel</button>
        <button className="bd-danger" disabled={typed !== "DELETE" || busy} onClick={onConfirm}>{busy ? "Deleting..." : "Delete permanently"}</button></div>
    </div></div>;
}

/* =============================== charts =============================== */
function RevenueChart({ a, height = 280 }: { a: Analytics; height?: number }) {
  if (!a.kpis.orders) return <Empty text="Abhi tak koi order nahi aaya. Pehla real order aate hi graph yahan dikhega." />;
  return <ResponsiveContainer width="100%" height={height}><ComposedChart data={a.series} margin={{ left: -10, right: 4 }}>
    <defs><linearGradient id="bdRev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6c5ce7" stopOpacity={0.35} /><stop offset="100%" stopColor="#6c5ce7" stopOpacity={0} /></linearGradient></defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#eceef7" vertical={false} />
    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" tickLine={false} axisLine={false} />
    <YAxis yAxisId="r" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} />
    <YAxis yAxisId="o" orientation="right" allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
    <Tooltip contentStyle={tipStyle} formatter={(v: number, n: string) => (n === "Revenue" ? inr(v) : v)} />
    <Area yAxisId="r" type="monotone" dataKey="revenue" name="Revenue" stroke="#6c5ce7" strokeWidth={2.5} fill="url(#bdRev)" />
    <Line yAxisId="o" type="monotone" dataKey="orders" name="Orders" stroke="#00b894" strokeWidth={2} dot={false} />
  </ComposedChart></ResponsiveContainer>;
}

function Funnel({ a }: { a: Analytics }) {
  const top = Math.max(1, a.funnel[0]?.value ?? 1);
  return <div className="bd-funnel">{a.funnel.map((f, i) => <div key={f.name}>
    <div className="bd-funnel-row"><span>{f.name}</span><strong>{num(f.value)}</strong></div>
    <div className="bd-bar"><span style={{ width: `${Math.max(2, (f.value / top) * 100)}%`, background: COLORS[i] }} /></div>
    {i > 0 && <small>{a.funnel[i - 1].value ? ((f.value / a.funnel[i - 1].value) * 100).toFixed(1) : "0"}% pichhle step se</small>}
  </div>)}</div>;
}

/* =============================== tabs =============================== */
function Overview({ a, orders, setTab, setStatus }: { a: Analytics; orders: AdminOrder[]; setTab: (t: Tab) => void; setStatus: (id: string, s: string) => void }) {
  const k = a.kpis, p = a.previous;
  const pending = orders.filter((o) => o.status === "Processing").slice(0, 5);
  const risk = a.inventory.filter((i) => i.stock <= 10 || (i.daysLeft !== null && i.daysLeft <= 7));
  return <>
    <div className="bd-today">
      <div><small>Aaj ki sales</small><strong>{inr(a.today.revenue)}</strong><Delta cur={a.today.revenue} prev={a.today.yRevenue} /></div>
      <div><small>Aaj ke orders</small><strong>{a.today.orders}</strong><Delta cur={a.today.orders} prev={a.today.yOrders} /></div>
      <div><small>Aaj ke visitors</small><strong>{num(a.today.visits)}</strong></div>
      <div><small>Pending orders</small><strong className={a.pendingOrders ? "warn" : ""}>{a.pendingOrders}</strong></div>
    </div>
    <div className="bd-kpis">
      <Kpi label="Revenue" value={inr(k.revenue)} cur={k.revenue} prev={p.revenue} icon={IndianRupee} spark={a.series.map((s) => s.revenue)} />
      <Kpi label="Orders" value={num(k.orders)} cur={k.orders} prev={p.orders} icon={ShoppingBag} spark={a.series.map((s) => s.orders)} />
      <Kpi label="Avg. order value" value={inr(k.aov)} cur={k.aov} prev={p.aov} icon={BarChart3} />
      <Kpi label="Visitors" value={num(k.visits)} cur={k.visits} prev={p.visits} icon={Eye} spark={a.series.map((s) => s.visits)} />
      <Kpi label="Conversion" value={`${k.conversion}%`} cur={k.conversion} prev={p.conversion} icon={Percent} />
      <Kpi label="Repeat customers" value={`${k.repeatRate}%`} cur={k.repeatRate} prev={p.repeatRate} icon={Repeat} />
    </div>
    <div className="bd-grid two">
      <Card title="Revenue & orders" sub={`Last ${a.days} days (real orders, cancelled excluded)`}><RevenueChart a={a} /></Card>
      <Card title="Sales funnel" sub="Visit → click → order"><Funnel a={a} /></Card>
    </div>
    <div className="bd-grid two">
      <Card title="Needs attention" sub="Processing orders" right={<button className="bd-link" onClick={() => setTab("orders")}>Sab dekho <ArrowRight size={13} /></button>}>
        {pending.length ? pending.map((o) => <div className="bd-line" key={o.id}><div><strong>{o.customerName}</strong><small>{o.productName} ×{o.quantity} · {dt(o.createdAt)}</small></div><b>{inr(o.total)}</b><button className="bd-mini" onClick={() => setStatus(o.id, "Confirmed")}><Check size={13} /> Confirm</button></div>) : <Empty text="Sab orders handle ho gaye 🎉" />}
      </Card>
      <Card title="Stock alerts" sub="Kam stock ya jaldi khatam hone wale">
        {risk.length ? risk.map((i) => <div className="bd-line" key={i.id}><div><strong>{i.name}</strong><small>{i.daysLeft !== null ? `~${i.daysLeft} din ka stock (${i.perDay}/din)` : "Abhi bikri nahi hui"}</small></div><span className={`bd-pill ${i.stock <= 5 ? "red" : "amber"}`}>{i.stock} left</span></div>) : <Empty text="Stock theek hai" />}
      </Card>
    </div>
  </>;
}

function AnalyticsTab({ a }: { a: Analytics }) {
  const k = a.kpis;
  const peak = [...a.hourly].sort((x, y) => y.orders - x.orders)[0];
  const bestWd = [...a.weekday].sort((x, y) => y.revenue - x.revenue)[0];
  const insights: string[] = [];
  if (a.bestDay) insights.push(`Sabse acha din ${a.bestDay.label} raha: ${inr(a.bestDay.revenue)} (${a.bestDay.orders} orders).`);
  if (peak?.orders) insights.push(`Sabse zyada orders ${peak.hour}:00–${peak.hour + 1}:00 ke beech aate hain, is time ads/offers chalao.`);
  if (bestWd?.revenue) insights.push(`${bestWd.name} sabse strong weekday hai (${inr(bestWd.revenue)}).`);
  if (k.visits && k.clicks) insights.push(`Visitors me se ${k.clickRate}% product par click karte hain, aur ${k.conversion}% order karte hain.`);
  if (k.cancelRate >= 15) insights.push(`Cancel rate ${k.cancelRate}% hai, ye high hai. COD orders confirm karne se pehle call karna try karo.`);
  const cod = a.byPayment.find((x) => x.name === "COD"), upi = a.byPayment.find((x) => x.name === "UPI");
  if (cod && upi && cod.count + upi.count) insights.push(`${Math.round((upi.count / (cod.count + upi.count)) * 100)}% customers UPI se pay kar rahe hain.`);
  if (a.projection.next7Revenue) insights.push(`Pichhle 7 din ke average ke hisaab se agle 7 din me ~${inr(a.projection.next7Revenue)} revenue ho sakta hai.`);
  const statusData = a.byStatus.filter((s) => s.count > 0);
  return <>
    <Card title="Smart insights" sub="Aapke real data se auto-generate hue">
      {insights.length ? <ul className="bd-insights">{insights.map((t) => <li key={t}><Sparkles size={14} /> {t}</li>)}</ul> : <Empty text="Insights ke liye kuch orders aur visits chahiye." />}
    </Card>
    <div className="bd-kpis small">
      <Kpi label="Items sold" value={num(k.units)} cur={k.units} prev={a.previous.units} icon={Package} />
      <Kpi label="New customers" value={num(k.newCustomers)} cur={k.newCustomers} prev={a.previous.newCustomers} icon={Users} />
      <Kpi label="Click rate" value={`${k.clickRate}%`} cur={k.clickRate} prev={a.previous.clickRate} icon={Eye} />
      <Kpi label="Cancel rate" value={`${k.cancelRate}%`} cur={k.cancelRate} prev={a.previous.cancelRate} icon={AlertTriangle} invert />
      <Kpi label="Inventory value" value={inr(a.inventoryValue)} cur={0} prev={0} icon={Tag} />
      <Kpi label="7-day forecast" value={inr(a.projection.next7Revenue)} cur={0} prev={0} icon={TrendingUp} />
    </div>
    <div className="bd-grid two">
      <Card title="Revenue & orders"><RevenueChart a={a} /></Card>
      <Card title="Traffic" sub="Visits aur product clicks">
        <ResponsiveContainer width="100%" height={280}><BarChart data={a.series} margin={{ left: -10 }}><CartesianGrid strokeDasharray="3 3" stroke="#eceef7" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} /><Tooltip contentStyle={tipStyle} /><Bar dataKey="visits" name="Visits" fill="#6c5ce7" radius={[4, 4, 0, 0]} /><Bar dataKey="clicks" name="Clicks" fill="#74b9ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
      </Card>
    </div>
    <div className="bd-grid three">
      <Card title="Order status">{statusData.length ? <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={statusData} dataKey="count" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>{statusData.map((s, i) => <Cell key={s.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={tipStyle} /></PieChart></ResponsiveContainer> : <Empty text="No orders" />}
        <div className="bd-legend">{statusData.map((s, i) => <span key={s.name}><i style={{ background: COLORS[i % COLORS.length] }} />{s.name} {s.count}</span>)}</div></Card>
      <Card title="Payment method">{a.byPayment.some((x) => x.count) ? <ResponsiveContainer width="100%" height={220}><PieChart><Pie data={a.byPayment} dataKey="count" nameKey="name" innerRadius={52} outerRadius={82} paddingAngle={3}>{a.byPayment.map((s, i) => <Cell key={s.name} fill={COLORS[i]} />)}</Pie><Tooltip contentStyle={tipStyle} /></PieChart></ResponsiveContainer> : <Empty text="No orders" />}
        <div className="bd-legend">{a.byPayment.map((s, i) => <span key={s.name}><i style={{ background: COLORS[i] }} />{s.name} · {s.count} · {inr(s.revenue)}</span>)}</div></Card>
      <Card title="Sales funnel"><Funnel a={a} /></Card>
    </div>
    <div className="bd-grid two">
      <Card title="Orders by hour" sub="Din ke kis time order aate hain (IST)"><ResponsiveContainer width="100%" height={220}><BarChart data={a.hourly} margin={{ left: -20 }}><XAxis dataKey="hour" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={tipStyle} labelFormatter={(h) => `${h}:00`} /><Bar dataKey="orders" name="Orders" fill="#00b894" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></Card>
      <Card title="Weekday performance"><ResponsiveContainer width="100%" height={220}><BarChart data={a.weekday} margin={{ left: -10 }}><XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} /><Tooltip contentStyle={tipStyle} formatter={(v: number) => inr(v)} /><Bar dataKey="revenue" name="Revenue" fill="#fdcb6e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card>
    </div>
    <div className="bd-grid two">
      <Card title="Top products">{a.topProducts.length ? <table className="bd-table"><thead><tr><th>Product</th><th>Units</th><th>Revenue</th></tr></thead><tbody>{a.topProducts.map((p) => <tr key={p.productId}><td>{p.name}</td><td>{p.units}</td><td>{inr(p.revenue)}</td></tr>)}</tbody></table> : <Empty text="No sales yet" />}</Card>
      <Card title="Top customers">{a.topCustomers.length ? <table className="bd-table"><thead><tr><th>Customer</th><th>Orders</th><th>Spent</th></tr></thead><tbody>{a.topCustomers.map((c) => <tr key={c.contact}><td>{c.name}<small>{c.contact}</small></td><td>{c.orders}</td><td>{inr(c.spent)}</td></tr>)}</tbody></table> : <Empty text="No customers yet" />}</Card>
    </div>
    <Card title="Inventory forecast" sub="Bikri ki speed ke hisaab se stock kitne din chalega">
      <div className="bd-scroll"><table className="bd-table"><thead><tr><th>Product</th><th>Stock</th><th>Sold ({a.days}d)</th><th>Per day</th><th>Days left</th></tr></thead><tbody>{a.inventory.map((i) => <tr key={i.id}><td>{i.name}</td><td>{i.stock}</td><td>{i.soldInPeriod}</td><td>{i.perDay}</td><td>{i.daysLeft === null ? "—" : <span className={`bd-pill ${i.daysLeft <= 7 ? "red" : i.daysLeft <= 14 ? "amber" : "green"}`}>{i.daysLeft} days</span>}</td></tr>)}</tbody></table></div>
    </Card>
  </>;
}

function OrdersTab({ orders, onStatus, onChanged, notify }: { orders: AdminOrder[]; onStatus: (id: string, s: string) => void; onChanged: () => void; notify: (m: string) => void }) {
  const [q, setQ] = useState(""); const [filter, setFilter] = useState("All"); const [open, setOpen] = useState<string | null>(null);
  const [sel, setSel] = useState<Set<string>>(new Set()); const [confirm, setConfirm] = useState<string[] | null>(null); const [busy, setBusy] = useState(false);
  const rows = useMemo(() => orders.filter((o) => (filter === "All" || o.status === filter) && `${o.id} ${o.customerName} ${o.customerContact} ${o.productName} ${o.address}`.toLowerCase().includes(q.toLowerCase())), [orders, q, filter]);
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const del = async () => { if (!confirm) return; setBusy(true); try { const r = await api<{ deleted: number }>("/admin/orders/bulk-delete", { method: "POST", body: JSON.stringify({ ids: confirm }) }); notify(`${r.deleted} order(s) delete ho gaye`); setSel(new Set()); setConfirm(null); onChanged(); } catch (e) { notify((e as Error).message); } finally { setBusy(false); } };
  const exportCsv = async () => { const r = await fetch("/api/admin/export/orders.csv", { credentials: "same-origin" }); const b = await r.blob(); const u = URL.createObjectURL(b); const l = document.createElement("a"); l.href = u; l.download = "buydo-orders.csv"; l.click(); URL.revokeObjectURL(u); };
  return <>
    <div className="bd-toolbar">
      <div className="bd-search"><Search size={15} /><input placeholder="Name, phone, order ID, address..." value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <div className="bd-chips">{["All", ...STATUSES].map((s) => <button key={s} className={filter === s ? "on" : ""} onClick={() => setFilter(s)}>{s} <span>{s === "All" ? orders.length : orders.filter((o) => o.status === s).length}</span></button>)}</div>
      <div className="bd-row"><button className="secondary-button compact" onClick={exportCsv}><Download size={14} /> CSV</button>
        {sel.size > 0 && <button className="bd-danger" onClick={() => setConfirm([...sel])}><Trash2 size={14} /> Delete {sel.size}</button>}</div>
    </div>
    {rows.length === 0 ? <Card title="Orders"><Empty text={orders.length ? "Koi order match nahi hua" : "Abhi koi order nahi aaya"} /></Card> :
      <div className="bd-orders">{rows.map((o) => <div className={`bd-order ${open === o.id ? "open" : ""}`} key={o.id}>
        <div className="bd-order-main">
          <input type="checkbox" checked={sel.has(o.id)} onChange={() => toggle(o.id)} aria-label="select" />
          <div className="bd-oid"><strong>#{o.id}</strong><small>{dt(o.createdAt)}</small></div>
          <div className="bd-ocust"><strong>{o.customerName}</strong><small>{o.customerContact}</small></div>
          <div className="bd-oprod"><span>{o.productName}</span><small>Qty {o.quantity} · {o.paymentMethod}</small></div>
          <b className="bd-ototal">{inr(o.total)}</b>
          <select className={`bd-status ${o.status.toLowerCase()}`} value={o.status} onChange={(e) => onStatus(o.id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <button className="bd-icon" onClick={() => setOpen(open === o.id ? null : o.id)} aria-label="details"><ChevronDown size={16} /></button>
        </div>
        {open === o.id && <div className="bd-detail">
          <div><small>Customer</small><strong>{o.customerName}</strong></div>
          <div><small>Phone / Email</small><strong>{o.customerContact}</strong></div>
          <div className="wide"><small>Delivery address</small><strong>{o.address}</strong></div>
          <div><small>Payment</small><strong>{o.paymentMethod}</strong></div>
          <div><small>Expected delivery</small><strong>{dOnly(o.deliveryDate)}</strong></div>
          <div><small>Placed on</small><strong>{dt(o.createdAt)}</strong></div>
          <div className="bd-row wide"><button className="secondary-button compact" onClick={() => { void navigator.clipboard.writeText(`${o.customerName}\n${o.customerContact}\n${o.address}`); notify("Details copy ho gayi"); }}><Copy size={13} /> Copy shipping details</button>
            <button className="bd-danger ghost" onClick={() => setConfirm([o.id])}><Trash2 size={13} /> Delete order</button></div>
        </div>}
      </div>)}</div>}
    {confirm && <ConfirmModal title={`${confirm.length} order delete karna hai?`} text="Ye order database se hamesha ke liye hat jayega (stock wapas nahi hoga)." onClose={() => setConfirm(null)} onConfirm={del} busy={busy} />}
  </>;
}

function ProductsTab({ orders }: { orders: AdminOrder[] }) {
  const { data: products = [], isLoading } = useListProducts();
  const qc = useQueryClient(); const del = useDeleteProduct();
  const [editor, setEditor] = useState<Product | "new" | null>(null);
  const sold = (id: string) => orders.filter((o) => o.productId === id && o.status !== "Cancelled").reduce((s, o) => s + o.quantity, 0);
  return <>
    <div className="bd-toolbar"><span className="bd-count">{products.length} live listing{products.length === 1 ? "" : "s"}</span><button className="primary-button" onClick={() => setEditor("new")}><Plus size={16} /> Add product</button></div>
    {isLoading ? <div className="skeleton-lines large" /> : products.length === 0 ? <Card title="Products"><Empty text="Koi product nahi hai. 'Add product' se pehla product banao." /></Card> :
      <div className="bd-products">{products.map((p) => <div className="bd-product" key={p.id}>
        <img src={p.images[0]} alt="" />
        <div className="bd-pinfo"><strong>{p.name}</strong><small>{p.category}</small></div>
        <div><small>Price</small><b>{inr(p.price)}</b></div>
        <div><small>Stock</small><b className={p.stock < 10 ? "low" : ""}>{p.stock}</b></div>
        <div><small>Sold</small><b>{sold(p.id)}</b></div>
        <div className="bd-row"><button className="bd-icon" onClick={() => setEditor(p)} aria-label="edit"><Pencil size={15} /></button>
          <button className="bd-icon red" aria-label="delete" onClick={() => window.confirm(`${p.name} ko storefront se hata dein?`) && del.mutate({ productId: p.id }, { onSuccess: () => qc.invalidateQueries({ queryKey: getListProductsQueryKey() }) })}><Trash2 size={15} /></button></div>
      </div>)}</div>}
    {editor && <ProductEditor product={editor === "new" ? undefined : editor} onClose={() => setEditor(null)} />}
  </>;
}

function CustomersTab({ customers, loading }: { customers: Customer[]; loading: boolean }) {
  const [q, setQ] = useState(""); const [open, setOpen] = useState<string | null>(null);
  const rows = customers.filter((c) => `${c.name} ${c.contact} ${c.address}`.toLowerCase().includes(q.toLowerCase()));
  return <>
    <div className="bd-toolbar"><div className="bd-search"><Search size={15} /><input placeholder="Search customers..." value={q} onChange={(e) => setQ(e.target.value)} /></div><span className="bd-count">{customers.length} customers</span></div>
    {loading ? <div className="skeleton-lines large" /> : rows.length === 0 ? <Card title="Customers"><Empty text="Customers wahi dikhenge jinhone order kiya hai." /></Card> :
      <div className="bd-orders">{rows.map((c) => <div className={`bd-order ${open === c.contact ? "open" : ""}`} key={c.contact}>
        <div className="bd-order-main cust">
          <span className="bd-avatar">{c.name.slice(0, 2).toUpperCase()}</span>
          <div className="bd-ocust"><strong>{c.name}</strong><small>{c.contact}</small></div>
          <div className="bd-oprod"><span>{c.orders} order{c.orders > 1 ? "s" : ""}{c.orders > 1 && <span className="bd-pill green">Repeat</span>}</span><small>Last: {dt(c.lastOrder)}</small></div>
          <b className="bd-ototal">{inr(c.spent)}</b>
          <button className="bd-icon" onClick={() => setOpen(open === c.contact ? null : c.contact)}><ChevronDown size={16} /></button>
        </div>
        {open === c.contact && <div className="bd-detail"><div className="wide"><small>Addresses used</small>{c.addresses.map((a) => <strong key={a}>{a}</strong>)}</div>
          <div><small>First order</small><strong>{dOnly(c.firstOrder)}</strong></div><div><small>Cancelled</small><strong>{c.cancelled}</strong></div>
          <div className="wide"><small>Order IDs</small><strong>{c.orderIds.join(", ")}</strong></div></div>}
      </div>)}</div>}
  </>;
}

function DatabaseTab({ db, onChanged, notify }: { db?: DbOverview; onChanged: () => void; notify: (m: string) => void }) {
  const [status, setStatus] = useState(""); const [days, setDays] = useState(""); const [job, setJob] = useState<null | { title: string; text: string; run: () => Promise<{ deleted: number }> }>(null); const [busy, setBusy] = useState(false);
  const run = async () => { if (!job) return; setBusy(true); try { const r = await job.run(); notify(`${r.deleted} record(s) delete ho gaye`); setJob(null); onChanged(); } catch (e) { notify((e as Error).message); } finally { setBusy(false); } };
  const purge = (body: object) => () => api<{ deleted: number }>("/admin/data/purge", { method: "POST", body: JSON.stringify({ ...body, confirm: "DELETE" }) });
  if (!db) return <div className="skeleton-lines large" />;
  const n = Number(days);
  return <>
    <div className="bd-kpis small">
      <div className="bd-kpi"><span>Products</span><strong>{db.products}</strong></div><div className="bd-kpi"><span>Orders</span><strong>{db.orders}</strong></div>
      <div className="bd-kpi"><span>Traffic days stored</span><strong>{db.analyticsDays}</strong></div>
      <div className="bd-kpi"><span>Oldest order</span><strong className="sm">{db.oldestOrder ? dOnly(db.oldestOrder) : "—"}</strong></div>
    </div>
    <div className="bd-grid two">
      <Card title="Storage" sub="Table-wise size">{db.sizes.length ? <table className="bd-table"><tbody>{db.sizes.map((s) => <tr key={s.name}><td>{s.name}</td><td>{bytes(s.bytes)}</td></tr>)}</tbody></table> : <Empty text="Size info available nahi" />}</Card>
      <Card title="Orders by status">{db.statuses.length ? <table className="bd-table"><tbody>{db.statuses.map((s) => <tr key={s.status}><td>{s.status}</td><td>{s.count}</td></tr>)}</tbody></table> : <Empty text="No orders" />}</Card>
    </div>
    <Card title="Data cleanup" sub="Dhyan se: delete hua data wapas nahi aata. Pehle CSV export kar lo.">
      <div className="bd-clean">
        <div className="bd-clean-row"><div><strong>Filter se orders delete karo</strong><small>Status aur/ya itne din se purane orders</small></div>
          <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          <input type="number" min="0" placeholder="Older than (days)" value={days} onChange={(e) => setDays(e.target.value)} />
          <button className="bd-danger" disabled={!status && !(n > 0)} onClick={() => setJob({ title: "Filtered orders delete karein?", text: `${status || "Sab status"}${n > 0 ? `, ${n} din se purane` : ""} orders delete honge.`, run: purge({ target: "orders", status: status || undefined, olderThanDays: n > 0 ? n : undefined }) })}>Delete</button></div>
        <div className="bd-clean-row"><div><strong>Purane sample orders hatao</strong><small>Earlier demo version ke DC-1047, DC-1048</small></div>
          <button className="bd-danger ghost" onClick={() => setJob({ title: "Sample orders delete karein?", text: "Sirf DC-1047 aur DC-1048 hatenge.", run: () => api("/admin/data/purge-demo", { method: "POST" }) })}>Remove samples</button></div>
        <div className="bd-clean-row"><div><strong>Traffic analytics reset</strong><small>Visits/clicks ka saara record</small></div>
          <button className="bd-danger ghost" onClick={() => setJob({ title: "Traffic data reset karein?", text: "Saare visits aur clicks zero ho jayenge.", run: purge({ target: "analytics", all: true }) })}>Reset traffic</button></div>
        <div className="bd-clean-row"><div><strong>Saare orders delete karo</strong><small>Poora order history khali ho jayegi</small></div>
          <button className="bd-danger" onClick={() => setJob({ title: "SAARE orders delete karein?", text: `${db.orders} orders hamesha ke liye delete honge.`, run: purge({ target: "orders", all: true }) })}>Delete all orders</button></div>
      </div>
    </Card>
    {job && <ConfirmModal title={job.title} text={job.text} onClose={() => setJob(null)} onConfirm={run} busy={busy} />}
  </>;
}

/* =============================== shell =============================== */
const NAV: { id: Tab; label: string; icon: typeof Eye }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "orders", label: "Orders", icon: ShoppingBag }, { id: "products", label: "Products", icon: Tag },
  { id: "customers", label: "Customers", icon: Users }, { id: "database", label: "Database", icon: Database },
];

function Workspace({ onLogout }: { onLogout: () => void }) {
  const [, navigate] = useLocation(); const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview"); const [days, setDays] = useState(30); const [nav, setNav] = useState(false); const [toast, setToast] = useState("");
  const live = { refetchInterval: 30_000, retry: 1 };
  const analytics = useQuery({ queryKey: ["bd-analytics", days], queryFn: () => api<Analytics>(`/admin/analytics?days=${days}`), ...live });
  const orders = useQuery({ queryKey: ["bd-orders"], queryFn: () => api<AdminOrder[]>("/orders"), ...live });
  const customers = useQuery({ queryKey: ["bd-customers"], queryFn: () => api<Customer[]>("/admin/customers"), enabled: tab === "customers" });
  const dbo = useQuery({ queryKey: ["bd-db"], queryFn: () => api<DbOverview>("/admin/db/overview"), enabled: tab === "database" });
  const { data: products = [] } = useListProducts();
  useEffect(() => { if ([analytics, orders, customers, dbo].some((q) => q.error instanceof AuthError)) onLogout(); }, [analytics.error, orders.error, customers.error, dbo.error, onLogout]);
  const notify = (m: string) => { setToast(m); window.setTimeout(() => setToast(""), 3200); };
  const refresh = () => { void qc.invalidateQueries({ predicate: (q) => String(q.queryKey[0]).startsWith("bd-") }); void qc.invalidateQueries({ queryKey: getListProductsQueryKey() }); };
  const setStatus = async (id: string, status: string) => { try { await api(`/orders/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); refresh(); notify(`Order ${status} mark ho gaya`); } catch (e) { notify((e as Error).message); } };
  const list = orders.data ?? [];
  const hour = new Date().getHours();
  const titles: Record<Tab, string> = { overview: `${hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"}, BuyDo admin`, analytics: "Analytics & insights", orders: "Order operations", products: "Product catalog", customers: "Customers", database: "Database & cleanup" };
  const range = <div className="bd-range">{[7, 30, 90].map((d) => <button key={d} className={days === d ? "on" : ""} onClick={() => setDays(d)}>{d}d</button>)}</div>;
  const a = analytics.data;
  return <div className="bd-shell">
    <aside className={`bd-side ${nav ? "open" : ""}`}>
      <div className="bd-brand"><span><Sparkles size={16} fill="currentColor" /></span>BuyDo<i>.</i><button className="bd-icon close" onClick={() => setNav(false)}><X size={18} /></button></div>
      <nav>{NAV.map((n) => <button key={n.id} className={tab === n.id ? "on" : ""} onClick={() => { setTab(n.id); setNav(false); }}><n.icon size={17} />{n.label}
        {n.id === "orders" && a && a.pendingOrders > 0 && <em>{a.pendingOrders}</em>}{n.id === "products" && <em className="mute">{products.length}</em>}</button>)}</nav>
      <div className="bd-side-foot"><button onClick={() => navigate("/")}><ArrowRight size={15} /> View storefront</button>
        <button onClick={async () => { await api("/admin/logout", { method: "POST" }).catch(() => undefined); qc.clear(); onLogout(); }}><LockKeyhole size={15} /> Sign out</button></div>
    </aside>
    {nav && <div className="bd-scrim" onClick={() => setNav(false)} />}
    <main className="bd-main">
      <header className="bd-top"><button className="bd-icon menu" onClick={() => setNav(true)}><Menu size={20} /></button>
        <div><small>{new Intl.DateTimeFormat("en-IN", { dateStyle: "full", timeZone: "Asia/Kolkata" }).format(new Date())}</small><h1>{titles[tab]}</h1></div>
        <div className="bd-row">{(tab === "overview" || tab === "analytics") && range}<button className="bd-icon" onClick={refresh} aria-label="refresh"><RefreshCcw size={16} className={analytics.isFetching ? "spin" : ""} /></button><span className="bd-live"><i /> Live</span></div></header>
      <div className="bd-content">
        {(tab === "overview" || tab === "analytics") && (!a ? (analytics.isError ? <Card title="Data load nahi hua"><Empty text={(analytics.error as Error).message} /></Card> : <div className="skeleton-lines large" />) : tab === "overview" ? <Overview a={a} orders={list} setTab={setTab} setStatus={setStatus} /> : <AnalyticsTab a={a} />)}
        {tab === "orders" && (orders.isLoading ? <div className="skeleton-lines large" /> : <OrdersTab orders={list} onStatus={setStatus} onChanged={refresh} notify={notify} />)}
        {tab === "products" && <ProductsTab orders={list} />}
        {tab === "customers" && <CustomersTab customers={customers.data ?? []} loading={customers.isLoading} />}
        {tab === "database" && <DatabaseTab db={dbo.data} onChanged={refresh} notify={notify} />}
      </div>
    </main>
    {toast && <div className="bd-toast">{toast}</div>}
  </div>;
}

export function AdminDashboard() {
  const [session, setSession] = useState<"loading" | "signed-out" | "signed-in">("loading");
  useEffect(() => { fetch("/api/admin/session", { credentials: "same-origin" }).then((r) => r.json() as Promise<{ authenticated?: boolean }>).then((r) => setSession(r.authenticated ? "signed-in" : "signed-out")).catch(() => setSession("signed-out")); }, []);
  if (session === "loading") return <div className="page-loader"><div className="loader-orb" /><span>Loading secure workspace...</span></div>;
  if (session === "signed-out") return <AdminAuthScreen onLogin={() => setSession("signed-in")} />;
  return <Workspace onLogout={() => setSession("signed-out")} />;
}
