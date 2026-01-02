'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Item = {
  id: string;
  name: string;
  weight: number; // 1~10
  enabled: boolean;
};

const STORAGE_KEY = 'today-what:v1';

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pickWeighted(items: Item[]) {
  const pool = items.filter((i) => i.enabled && i.weight > 0);
  const total = pool.reduce((s, i) => s + i.weight, 0);
  if (pool.length === 0 || total <= 0) return null;

  let r = Math.random() * total;
  for (const it of pool) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return pool[pool.length - 1] ?? null;
}

type Saved = {
  items: Item[];
  // 最近抽到的 id（用于“避免重复”）
  recent: string[];
};

const DEFAULT_ITEMS: Item[] = [
  { id: uid(), name: '麻辣烫', weight: 3, enabled: true },
  { id: uid(), name: '黄焖鸡', weight: 2, enabled: true },
  { id: uid(), name: '兰州拉面', weight: 2, enabled: true },
  { id: uid(), name: '炸鸡汉堡', weight: 2, enabled: true },
  { id: uid(), name: '寿司', weight: 1, enabled: true },
];

export default function Page() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [recent, setRecent] = useState<string[]>([]);
  const [result, setResult] = useState<Item | null>(null);

  const [newName, setNewName] = useState('');
  const [newWeight, setNewWeight] = useState(2);

  const [avoidRepeat, setAvoidRepeat] = useState(true);
  const [avoidCount, setAvoidCount] = useState(3);
  const [transferText, setTransferText] = useState('');
  const [transferMsg, setTransferMsg] = useState<string | null>(null);

  // 读取本地存档
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: Saved = JSON.parse(raw);
      if (Array.isArray(parsed.items)) setItems(parsed.items);
      if (Array.isArray(parsed.recent)) setRecent(parsed.recent);
    } catch {
      // ignore
    }
  }, []);

  // 写入本地存档
  useEffect(() => {
    try {
      const saved: Saved = { items, recent };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch {
      // ignore
    }
  }, [items, recent]);

  const enabledCount = useMemo(
    () => items.filter((i) => i.enabled).length,
    [items]
  );

  const draw = () => {
    let candidates = items;

    if (avoidRepeat && recent.length > 0) {
      const ban = new Set(recent.slice(0, clamp(avoidCount, 0, 50)));
      const filtered = items.filter((i) => !ban.has(i.id));
      // 如果过滤后没得抽了，就退回全量
      if (filtered.some((i) => i.enabled && i.weight > 0)) {
        candidates = filtered;
      }
    }

    const picked = pickWeighted(candidates);
    setResult(picked);

    if (picked) {
      setRecent((prev) => {
        const next = [picked.id, ...prev.filter((id) => id !== picked.id)];
        return next.slice(0, 20); // 最多记 20 个
      });
    }
  };

  const addItem = () => {
    const name = newName.trim();
    if (!name) return;
    const w = clamp(Number(newWeight) || 1, 1, 10);
    setItems((prev) => [{ id: uid(), name, weight: w, enabled: true }, ...prev]);
    setNewName('');
    setNewWeight(2);
  };

  const updateItem = (id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };
const exportMenu = async () => {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
  };
  const text = JSON.stringify(payload, null, 2);
  setTransferText(text);

  try {
    await navigator.clipboard.writeText(text);
    setTransferMsg('已导出并复制到剪贴板');
    setTimeout(() => setTransferMsg(null), 2000);
  } catch {
    setTransferMsg('已导出到文本框（剪贴板复制失败，可手动复制）');
    setTimeout(() => setTransferMsg(null), 2500);
  }
};

const importMenu = () => {
  const raw = transferText.trim();
  if (!raw) {
    setTransferMsg('文本框为空，无法导入');
    setTimeout(() => setTransferMsg(null), 2000);
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    // 兼容两种格式：
    // 1) { items: [...] }
    // 2) 直接就是 [...]
    const incoming = Array.isArray(parsed) ? parsed : parsed.items;

    if (!Array.isArray(incoming)) throw new Error('Invalid format');

    const normalized: Item[] = incoming
      .map((x: any) => ({
        id: typeof x.id === 'string' && x.id ? x.id : uid(),
        name: String(x.name ?? '').trim(),
        weight: clamp(Number(x.weight) || 1, 1, 10),
        enabled: Boolean(x.enabled ?? true),
      }))
      .filter((x) => x.name.length > 0);

    if (normalized.length === 0) {
      setTransferMsg('导入失败：没有有效菜单项');
      setTimeout(() => setTransferMsg(null), 2500);
      return;
    }

    if (!confirm(`确定导入 ${normalized.length} 个菜单项吗？这会覆盖当前菜单。`)) return;

    setItems(normalized);
    setRecent([]);
    setResult(null);

    setTransferMsg('导入成功');
    setTimeout(() => setTransferMsg(null), 2000);
  } catch {
    setTransferMsg('导入失败：JSON 格式不正确');
    setTimeout(() => setTransferMsg(null), 2500);
  }
};
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setRecent((prev) => prev.filter((x) => x !== id));
    if (result?.id === id) setResult(null);
  };

  const resetAll = () => {
    if (!confirm('确定重置为默认菜单吗？（会清空你的自定义内容）')) return;
    setItems(DEFAULT_ITEMS);
    setRecent([]);
    setResult(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">今天吃什么</h1>
          <p className="mt-2 text-sm text-gray-400">
            随机推荐 + 权重 + 可编辑菜单（数据保存在你的浏览器里）
          </p>
        </header>

        <section className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm text-gray-400">本次推荐</div>
              <div className="mt-1 text-3xl font-bold">
                {result?.name ?? '—'}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                可抽选项：{enabledCount} 个
              </div>
            </div>
            <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950/30 p-4">
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <div className="text-sm font-medium">导入 / 导出</div>
      <div className="mt-1 text-xs text-gray-500">
        用于备份菜单、换设备迁移（复制 JSON）
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={exportMenu}
        className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200"
      >
        导出
      </button>
      <button
        onClick={importMenu}
        className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
      >
        导入（覆盖）
      </button>
    </div>
  </div>

  {transferMsg ? (
    <div className="mt-3 text-xs text-gray-300">{transferMsg}</div>
  ) : null}

  <textarea
    value={transferText}
    onChange={(e) => setTransferText(e.target.value)}
    placeholder="点击“导出”生成 JSON；或粘贴 JSON 后点“导入（覆盖）”"
    className="mt-3 h-40 w-full rounded-lg border border-gray-800 bg-gray-950/40 p-3 text-xs text-gray-100 outline-none"
  />
</div>
            <div className="flex gap-2">
              <button
                onClick={draw}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200"
              >
                抽一个
              </button>
              <button
                onClick={() => setResult(null)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-800"
              >
                清空
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-950/30 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">避免重复</div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={avoidRepeat}
                  onChange={(e) => setAvoidRepeat(e.target.checked)}
                  className="h-4 w-4"
                />
                开启
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="text-sm text-gray-400">最近</div>
              <input
                type="number"
                min={0}
                max={10}
                value={avoidCount}
                onChange={(e) => setAvoidCount(clamp(Number(e.target.value) || 0, 0, 10))}
                className="w-24 rounded-md border border-gray-800 bg-gray-950/50 px-3 py-2 text-sm text-gray-100 outline-none"
              />
              <div className="text-sm text-gray-400">次不重复（最多 10）</div>
            </div>

            <div className="text-xs text-gray-500">
              说明：如果你只剩下“被排除的项”，会自动退回全量抽取，避免抽不到。
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-gray-800 bg-gray-900/40 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">菜单</h2>
            <button
              onClick={resetAll}
              className="rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
            >
              重置默认
            </button>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="添加一个：比如 烧烤"
              className="flex-1 rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 text-sm outline-none"
            />
            <div className="flex gap-2">
              <select
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="rounded-lg border border-gray-800 bg-gray-950/40 px-3 py-2 text-sm outline-none"
              >
                {Array.from({ length: 10 }).map((_, idx) => {
                  const v = idx + 1;
                  return (
                    <option key={v} value={v}>
                      权重 {v}
                    </option>
                  );
                })}
              </select>
              <button
                onClick={addItem}
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-400"
              >
                添加
              </button>
            </div>
          </div>

          <div className="mt-4 divide-y divide-gray-800 rounded-lg border border-gray-800">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-gray-400">还没有菜单项</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={it.enabled}
                      onChange={(e) => updateItem(it.id, { enabled: e.target.checked })}
                      className="h-4 w-4"
                      title="启用/禁用"
                    />
                    <input
                      value={it.name}
                      onChange={(e) => updateItem(it.id, { name: e.target.value })}
                      className="w-full rounded-md border border-gray-800 bg-gray-950/40 px-3 py-2 text-sm outline-none sm:w-64"
                    />
                  </div>

                  <div className="flex items-center gap-2 sm:ml-auto">
                    <span className="text-xs text-gray-400">权重</span>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={it.weight}
                      onChange={(e) =>
                        updateItem(it.id, { weight: clamp(Number(e.target.value) || 1, 1, 10) })
                      }
                      className="w-20 rounded-md border border-gray-800 bg-gray-950/40 px-3 py-2 text-sm outline-none"
                    />
                    <button
                      onClick={() => removeItem(it.id)}
                      className="rounded-md border border-gray-700 px-3 py-2 text-sm text-gray-200 hover:bg-gray-800"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 text-xs text-gray-500">
            小技巧：把常吃的设高一点权重，不想吃就取消勾选。
          </div>
        </section>

        <footer className="mt-10 text-center text-xs text-gray-600">
          部署在 Cloudflare Pages · 数据仅保存在本机浏览器
        </footer>
      </div>
    </main>
  );
}