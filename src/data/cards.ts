import type { Card, ArchiveEntry } from '../types';

export const CARDS: Card[] = [
  // ── 1. 概念介绍 ──────────────────────────────────────────────────────────
  {
    type: 'content',
    tag: '概念介绍',
    tagCls: 'tagConcept',
    title: '什么是机器学习？',
    html: `
      <p>机器学习（Machine Learning）是人工智能的核心子领域，让计算机系统从数据中<strong>自动学习与改进</strong>，无需针对每项任务逐一编程。</p>
      <p>传统编程由程序员写下规则；机器学习则反其道而行之——我们提供大量数据和期望结果，算法自行发现规律。</p>
      <div class="kblock">
        <div class="kblock-name">经典定义</div>
        <div class="kblock-desc">「一个程序在任务 T 上的性能 P，随着经验 E 的积累而自动提升，则称该程序在从经验中学习。」— Tom Mitchell, 1997</div>
      </div>
    `,
  },

  // ── 2. 核心分类 ──────────────────────────────────────────────────────────
  {
    type: 'content',
    tag: '核心分类',
    tagCls: 'tagConcept',
    title: '三大学习范式',
    html: `
      <p>机器学习按训练数据形式与学习目标，分为三大主要范式：</p>
      <div class="kblock">
        <div class="kblock-name">① 监督学习 Supervised Learning</div>
        <div class="kblock-desc">使用<strong>带标注标签</strong>的训练数据，算法学习输入→输出的映射。典型任务：分类、回归。代表算法：决策树、神经网络。</div>
      </div>
      <div class="kblock">
        <div class="kblock-name">② 无监督学习 Unsupervised Learning</div>
        <div class="kblock-desc">训练数据<strong>无标签</strong>，算法自行发现数据的内在结构。典型任务：聚类、降维。代表算法：K-Means、PCA。</div>
      </div>
      <div class="kblock">
        <div class="kblock-name">③ 强化学习 Reinforcement Learning</div>
        <div class="kblock-desc">智能体通过与环境交互，依据<strong>奖惩反馈</strong>学习最优决策策略。代表应用：AlphaGo、游戏 AI。</div>
      </div>
    `,
  },

  // ── 3. 测验：概念理解 ────────────────────────────────────────────────────
  {
    type: 'quiz',
    tag: '知识测验',
    tagCls: 'tagQuiz',
    title: '概念理解',
    question: '以下哪种学习方式需要带标注标签的训练数据？',
    options: [
      { l: 'A', t: '无监督学习' },
      { l: 'B', t: '强化学习' },
      { l: 'C', t: '监督学习' },
      { l: 'D', t: '迁移学习' },
    ],
    correct: 'C',
    explain: '监督学习依赖「输入-标签」对来学习映射关系。无监督学习无需标签，强化学习依靠奖惩信号，而非预先标注的答案。',
  },

  // ── 4. 阶段复习 ──────────────────────────────────────────────────────────
  {
    type: 'review',
    tag: '阶段复习',
    tagCls: 'tagReview',
    title: '阶段复习：核心概念检测',
    keyPoints: '机器学习定义、三大学习范式（监督/无监督/强化）、监督学习核心特征',
    question: '监督学习区别于其他范式的根本特征是什么？',
    options: [
      { l: 'A', t: '无需任何训练数据' },
      { l: 'B', t: '使用带标注标签的训练数据' },
      { l: 'C', t: '依靠环境交互获得奖惩反馈' },
      { l: 'D', t: '自动发现数据隐藏规律' },
    ],
    correct: 'B',
    explain: '监督学习的核心是「有老师的学习」——每个训练样本都带有正确答案（标签），模型从「输入→标签」对中学习映射规则。',
  },

  // ── 5. 深入理解 ──────────────────────────────────────────────────────────
  {
    type: 'content',
    tag: '深入理解',
    tagCls: 'tagConcept',
    title: '监督学习的工作原理',
    html: `
      <p>监督学习的完整流程分为三个阶段：</p>
      <p><strong>① 训练阶段</strong>：向模型输入大量带标签样本，模型通过反复调整内部参数，逐步学习区分特征。</p>
      <div class="kblock">
        <div class="kblock-name">损失函数（Loss Function）</div>
        <div class="kblock-desc">衡量模型预测值与真实值差距的数学函数。训练目标就是<strong>最小化损失函数</strong>。常用：均方误差（MSE）、交叉熵损失（Cross-Entropy）。</div>
      </div>
      <p><strong>② 验证阶段</strong>：用模型从未见过的验证集评估性能，防止模型"死记硬背"训练集。</p>
      <p><strong>③ 推理阶段</strong>：将训练完成的模型部署到生产环境，对新的未知数据进行实时预测。</p>
    `,
  },

  // ── 6. 应用场景 ──────────────────────────────────────────────────────────
  {
    type: 'content',
    tag: '应用场景',
    tagCls: 'tagConcept',
    title: '机器学习的实际应用',
    html: `
      <p>机器学习已深度融入现代生活的各个场景：</p>
      <div class="kblock">
        <div class="kblock-name">计算机视觉</div>
        <div class="kblock-desc">图像识别、人脸检测、医学影像分析（肺癌筛查准确率已超越部分专科医生）、自动驾驶感知系统。</div>
      </div>
      <div class="kblock">
        <div class="kblock-name">自然语言处理（NLP）</div>
        <div class="kblock-desc">机器翻译、智能问答（ChatGPT）、情感分析、自动文档摘要生成。</div>
      </div>
      <div class="kblock">
        <div class="kblock-name">推荐系统</div>
        <div class="kblock-desc">Netflix 影视推荐、淘宝商品推荐、Spotify 歌单——这些系统每天影响着数十亿次用户决策。</div>
      </div>
    `,
  },

  // ── 7. 测验：因果逻辑 ────────────────────────────────────────────────────
  {
    type: 'quiz',
    tag: '知识测验',
    tagCls: 'tagQuiz',
    title: '因果逻辑',
    question: '梯度下降法（Gradient Descent）的主要目的是什么？',
    options: [
      { l: 'A', t: '增加模型的复杂度' },
      { l: 'B', t: '最小化损失函数' },
      { l: 'C', t: '扩大训练数据集规模' },
      { l: 'D', t: '加速数据读取速度' },
    ],
    correct: 'B',
    explain: '梯度下降通过沿损失函数梯度的反方向迭代更新模型参数，使损失值持续降低——这是绝大多数机器学习训练的核心优化机制。',
  },

  // ── 8. 关键概念 ──────────────────────────────────────────────────────────
  {
    type: 'content',
    tag: '关键概念',
    tagCls: 'tagConcept',
    title: '过拟合与欠拟合',
    html: `
      <p>训练机器学习模型时，两个最常见的挑战：</p>
      <div class="kblock">
        <div class="kblock-name">过拟合（Overfitting）</div>
        <div class="kblock-desc">模型在训练集表现极好，但在新数据上表现差。原因：模型「记住」了训练数据的噪声，而非学到真正的规律。应对：增加数据、正则化（L1/L2）、Dropout、早停。</div>
      </div>
      <div class="kblock">
        <div class="kblock-name">欠拟合（Underfitting）</div>
        <div class="kblock-desc">模型在训练集和新数据上表现都差。原因：模型过于简单，无法捕捉复杂规律。应对：使用更复杂的模型或加强特征工程。</div>
      </div>
      <p>好的模型在<strong>偏差（Bias）与方差（Variance）之间取得平衡</strong>。</p>
    `,
  },

  // ── 9. 测验：应用判断 ────────────────────────────────────────────────────
  {
    type: 'quiz',
    tag: '知识测验',
    tagCls: 'tagQuiz',
    title: '应用判断',
    question: '一个模型训练集准确率 99%，但测试集准确率只有 62%，最可能出现了什么问题？',
    options: [
      { l: 'A', t: '欠拟合，模型过于简单' },
      { l: 'B', t: '过拟合，模型记住了训练数据噪声' },
      { l: 'C', t: '学习率设置过低' },
      { l: 'D', t: '训练数据太多导致混乱' },
    ],
    correct: 'B',
    explain: '训练集与测试集准确率的巨大差距是过拟合的典型特征——模型死记硬背了训练样本（含噪声），丧失了对新数据的泛化能力。',
  },

  // ── 10. 输出闭环 ─────────────────────────────────────────────────────────
  {
    type: 'output',
    tag: '输出闭环',
    tagCls: 'tagOutput',
    title: '输出闭环：机器学习实践启示',
    summary: '机器学习通过数据驱动让计算机从经验中学习。监督学习依赖标注数据，用梯度下降最小化损失；好的模型需在偏差与方差间取得平衡，正则化、早停等手段可有效对抗过拟合。',
    question: '以下哪种做法最有助于解决机器学习中的过拟合问题？',
    options: [
      { l: 'A', t: '大幅增加模型层数和参数量' },
      { l: 'B', t: '减少训练数据' },
      { l: 'C', t: '使用正则化并收集更多训练数据' },
      { l: 'D', t: '提高学习率使模型更快收敛' },
    ],
    correct: 'C',
    explain: '正则化（L1/L2）通过在损失函数中加入惩罚项限制模型复杂度；增加训练数据则让模型接触更多真实规律，两者结合是对抗过拟合最有效的方式。',
  },

  // ── 完成卡 ───────────────────────────────────────────────────────────────
  { type: 'complete' },
];

export const DEFAULTS: ArchiveEntry[] = [
  {
    id: 'def-0',
    title: '深度学习入门',
    sourceType: 'url',
    date: '2026-02-18',
    score: '4/5',
    perfect: false,
  },
  {
    id: 'def-1',
    title: 'Python 数据分析实战',
    sourceType: 'pdf',
    date: '2026-02-24',
    score: '3/4',
    perfect: false,
  },
];
