'use client';

import React, { useMemo, useState } from 'react';

type Mainline = '找工作' | '学技能' | '做内容' | '生活整理';
type TimeOpt = 30 | 60 | 90 | 120;

type Task = {
  id: string;
  mainline: Mainline;
  title: string;
  minutes: 10 | 15 | 20 | 25 | 30;
  why: string;
  energyMin: 1 | 2 | 3 | 4 | 5;
};

const TASKS: Task[] = [
  // 找工作
  { id: 'job-1', mainline: '找工作', title: '改简历：把1条经历写成STAR结构', minutes: 25, why: '先提升简历可读性，后续投递才有效', energyMin: 2 },
  { id: 'job-2', mainline: '找工作', title: '投递1个岗位（只投最匹配的）', minutes: 20, why: '先建立投递节奏，避免只思考不行动', energyMin: 3 },
  { id: 'job-3', mainline: '找工作', title: '写一段自我介绍（100字以内）', minutes: 15, why: '降低沟通成本，后续找人/面试更顺', energyMin: 2 },
  { id: 'job-4', mainline: '找工作', title: '整理作品集首页：加一句话定位+3个亮点', minutes: 30, why: '让别人3秒知道你是谁、能做什么', energyMin: 3 },
  { id: 'job-5', mainline: '找工作', title: '联系1位同学/校友要内推建议', minutes: 15, why: '真实信息比你“找方向”有效', energyMin: 2 },
  { id: 'job-6', mainline: '找工作', title: '列出10个目标公司/岗位关键词', minutes: 20, why: '明确靶子，避免漫无目的刷', energyMin: 2 },
  { id: 'job-7', mainline: '找工作', title: '复盘上次面试：写3个问题+更好答案', minutes: 25, why: '把失败变成可复用的提升', energyMin: 3 },
  { id: 'job-8', mainline: '找工作', title: '找1个JD：提取5个高频要求并对照自己', minutes: 20, why: '对齐市场需求，避免自嗨学习', energyMin: 2 },
  { id: 'job-9', mainline: '找工作', title: '写一条求职动态（50字）并发给3个人', minutes: 15, why: '让机会看见你，而不是等机会', energyMin: 2 },
  { id: 'job-10', mainline: '找工作', title: '把简历投递记录建个表（公司/岗位/日期）', minutes: 20, why: '用数据管理，而不是靠感觉焦虑', energyMin: 1 },

  // 学技能
  { id: 'skill-1', mainline: '学技能', title: '看1页官方文档并写5条笔记', minutes: 20, why: '用最小输入换来可复用理解', energyMin: 2 },
  { id: 'skill-2', mainline: '学技能', title: '做1个小练习（不超过30分钟）', minutes: 25, why: '技能靠动手，不靠收藏', energyMin: 3 },
  { id: 'skill-3', mainline: '学技能', title: '写一个最小demo：只实现1个功能点', minutes: 30, why: '压缩范围，快速形成闭环', energyMin: 3 },
  { id: 'skill-4', mainline: '学技能', title: '复盘昨天卡点：写下原因+解决路径', minutes: 15, why: '把“卡住”变成下次的捷径', energyMin: 2 },
  { id: 'skill-5', mainline: '学技能', title: '做一次代码清理：删无用文件/注释', minutes: 20, why: '降低维护成本，提升可持续', energyMin: 1 },
  { id: 'skill-6', mainline: '学技能', title: '写一个函数并补1个测试用例', minutes: 25, why: '用测试逼迫你理解边界', energyMin: 3 },
  { id: 'skill-7', mainline: '学技能', title: '写3个你不懂的问题并各找1个答案来源', minutes: 15, why: '主动定位未知，学习才高效', energyMin: 2 },
  { id: 'skill-8', mainline: '学技能', title: '把一个概念讲给“未来的你”（100字）', minutes: 15, why: '能讲出来才是真的懂', energyMin: 2 },
  { id: 'skill-9', mainline: '学技能', title: '做一次小重构：抽一个组件/函数', minutes: 25, why: '用小步改进保持代码健康', energyMin: 3 },
  { id: 'skill-10', mainline: '学技能', title: '列3个可落地的小项目点子并选1个最小化', minutes: 20, why: '把学习和产出绑在一起', energyMin: 2 },

  // 做内容
  { id: 'content-1', mainline: '做内容', title: '写3个选题标题（面向具体人群）', minutes: 15, why: '选题决定80%传播，先把标题写出来', energyMin: 2 },
  { id: 'content-2', mainline: '做内容', title: '写一个30秒短视频脚本（3段式）', minutes: 25, why: '先把结构定住再谈表达', energyMin: 3 },
  { id: 'content-3', mainline: '做内容', title: '剪一段素材（只剪开头10秒）', minutes: 20, why: '降低启动成本，先完成最难的开头', energyMin: 2 },
  { id: 'content-4', mainline: '做内容', title: '写一条“今天做了什么”的构建日志', minutes: 15, why: '持续曝光=持续获客', energyMin: 1 },
  { id: 'content-5', mainline: '做内容', title: '做1张封面/首图（只做信息层级）', minutes: 30, why: '封面决定点击，先解决清晰而不是好看', energyMin: 2 },
  { id: 'content-6', mainline: '做内容', title: '列出你目标用户的3个常见问题', minutes: 15, why: '内容来源于问题库，不是灵感', energyMin: 1 },
  { id: 'content-7', mainline: '做内容', title: '把一个观点改写成三种开头', minutes: 20, why: '测试表达，找到更抓人的切入', energyMin: 2 },
  { id: 'content-8', mainline: '做内容', title: '写一条评论区置顶文案（含链接/关键词）', minutes: 10, why: '把流量导到产品，不然白忙', energyMin: 1 },
  { id: 'content-9', mainline: '做内容', title: '录一遍口播（不剪辑也行）', minutes: 15, why: '先让自己习惯输出，再谈完美', energyMin: 3 },
  { id: 'content-10', mainline: '做内容', title: '复盘：这条内容想让用户做什么？写1句CTA', minutes: 10, why: '没有CTA就没有转化', energyMin: 1 },

  // 生活整理
  { id: 'life-1', mainline: '生活整理', title: '收拾桌面10分钟+扔掉3样不用的', minutes: 15, why: '环境清爽=启动阻力更低', energyMin: 1 },
  { id: 'life-2', mainline: '生活整理', title: '整理下载文件夹：归档/删除10个文件', minutes: 20, why: '减少噪音，提升效率', energyMin: 1 },
  { id: 'life-3', mainline: '生活整理', title: '洗衣/晾衣（只做一轮）', minutes: 30, why: '用小动作获得掌控感', energyMin: 1 },
  { id: 'life-4', mainline: '生活整理', title: '规划明天：写下Big3+开始时间', minutes: 15, why: '提前决策，明天少纠结', energyMin: 1 },
  { id: 'life-5', mainline: '生活整理', title: '清空收件箱/未读消息（只处理10条）', minutes: 20, why: '降低心理负担，集中注意', energyMin: 1 },
  { id: 'life-6', mainline: '生活整理', title: '准备健康补给：装一杯水+切点水果', minutes: 10, why: '体能是执行力的底层', energyMin: 1 },
  { id: 'life-7', mainline: '生活整理', title: '把房间走一圈：归位10件物品', minutes: 15, why: '快速恢复秩序感', energyMin: 1 },
  { id: 'life-8', mainline: '生活整理', title: '制定一个“今晚不刷手机”规则并写下来', minutes: 10, why: '先把分心源头切掉', energyMin: 2 },
  { id: 'life-9', mainline: '生活整理', title: '列一个购物/待办清单并删掉3项不必要的', minutes: 20, why: '做减法比做加法更重要', energyMin: 1 },
  { id: 'life-10', mainline: '生活整理', title: '做5分钟拉伸+深呼吸', minutes: 10, why: '让你从焦虑态回到可执行态', energyMin: 1 },
];

function pickTasks(mainline: Mainline, time: TimeOpt, energy: number): Task[] {
  const maxTaskMinutes = 30;
  const slots = Math.min(3, Math.max(1, Math.floor(time / 30))); // 30->1, 60->2, 90/120->3
  const pool = TASKS
    .filter(t => t.mainline === mainline)
    .filter(t => energy >= t.energyMin);

  const fallback = TASKS.filter(t => t.mainline === mainline);

  const source = pool.length >= slots ? pool : fallback;

  // 简单规则：精力低优先短任务；精力高允许更长
  const sorted = [...source].sort((a, b) => {
    const aScore = (energy <= 2 ? a.minutes : -a.minutes);
    const bScore = (energy <= 2 ? b.minutes : -b.minutes);
    return aScore - bScore;
  });

  // 去重取前3个
  const picked: Task[] = [];
  for (const t of sorted) {
    if (!picked.find(x => x.id === t.id)) picked.push(t);
    if (picked.length >= 3) break;
  }
  return picked;
}

export default function Page() {
  const [mainline, setMainline] = useState<Mainline>('找工作');
  const [time, setTime] = useState<TimeOpt>(60);
  const [energy, setEnergy] = useState<number>(3);
  const [tasks, setTasks] = useState<Task[]>([]);

  const canGenerate = useMemo(() => !!mainline && !!time && energy >= 1 && energy <= 5, [mainline, time, energy]);

  const feishuFormUrl = 'https://ocna905hqvmk.feishu.cn/share/base/form/shrcnAjmU8kSztto5zS6C9hqAbb';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="text-2xl font-bold tracking-tight">今天干什么</h1>
        <p className="mt-2 text-sm text-gray-600">
          选一下你的状态，我给你 3 个 30 分钟内能做完的任务。别想太多，先做一个。
        </p>

        <div className="mt-6 space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
          <div>
            <div className="text-sm font-medium">你今天的主线</div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(['找工作', '学技能', '做内容', '生活整理'] as Mainline[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => setMainline(opt)}
                  className={[
                    'rounded-lg border px-3 py-2 text-sm',
                    mainline === opt ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white hover:bg-gray-50',
                  ].join(' ')}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium">可用时间</div>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {([30, 60, 90, 120] as TimeOpt[]).map(opt => (
                <button
                  key={opt}
                  onClick={() => setTime(opt)}
                  className={[
                    'rounded-lg border px-3 py-2 text-sm',
                    time === opt ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white hover:bg-gray-50',
                  ].join(' ')}
                >
                  {opt} 分钟
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">精力：{energy}</div>
              <div className="text-xs text-gray-500">1低 5高</div>
            </div>
            <input
              className="mt-2 w-full"
              type="range"
              min={1}
              max={5}
              step={1}
              value={energy}
              onChange={(e) => setEnergy(parseInt(e.target.value, 10))}
            />
          </div>

          <button
            disabled={!canGenerate}
            onClick={() => setTasks(pickTasks(mainline, time, energy))}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            生成今天的 3 个任务
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {tasks.map((t) => (
            <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold">{t.title}</div>
                  <div className="mt-1 text-sm text-gray-600">预计时长：{t.minutes} 分钟</div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">为什么是它：</span>
                    <span className="text-gray-700">{t.why}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-xl bg-white p-4 text-sm shadow-sm ring-1 ring-gray-200">
          <div className="font-semibold">反馈（1分钟）</div>
          <p className="mt-1 text-gray-600">用一次就行：哪里看不懂/任务是否有用/你会不会照做。</p>
          <a
            className="mt-3 inline-block rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            href={feishuFormUrl}
            target="_blank"
            rel="noreferrer"
          >
            提交反馈
          </a>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          版本：Day1（只做可用+收反馈）
        </div>
      </div>
    </div>
  );
}