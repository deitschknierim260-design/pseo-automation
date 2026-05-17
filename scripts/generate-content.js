import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { validateAndFilter } from './content-validator.js';

const OUTPUT_DIR = 'content';
const REJECTED_DIR = 'content-rejected';

const keywords = [
  { zh: "如何学习Python编程入门", en: "learn-python-programming-basics" },
  { zh: "JavaScript面试题及答案2024", en: "javascript-interview-questions-2024" },
  { zh: "React框架学习路线推荐", en: "react-learning-path-guide" },
  { zh: "Node.js后端开发教程", en: "nodejs-backend-development-tutorial" },
  { zh: "CSS布局技巧大全", en: "css-layout-techniques" },
  { zh: "Git版本控制最佳实践", en: "git-version-control-best-practices" },
  { zh: "Docker容器化部署指南", en: "docker-container-deployment-guide" },
  { zh: "SQL数据库查询优化", en: "sql-database-query-optimization" },
  { zh: "TypeScript类型系统详解", en: "typescript-type-system-explained" },
  { zh: "Vue3组合式API教程", en: "vue3-composition-api-tutorial" },
  { zh: "Linux命令行常用命令", en: "linux-command-line-basics" },
  { zh: "HTTP协议基础知识", en: "http-protocol-fundamentals" },
  { zh: "RESTful API设计原则", en: "restful-api-design-principles" },
  { zh: "前端性能优化技巧", en: "frontend-performance-optimization" },
  { zh: "算法复杂度分析入门", en: "algorithm-complexity-analysis" },
  { zh: "MongoDB数据库使用教程", en: "mongodb-database-tutorial" },
  { zh: "Webpack打包配置指南", en: "webpack-configuration-guide" },
  { zh: "ES6新特性详解", en: "es6-features-explained" },
  { zh: "移动端网页适配方案", en: "mobile-web-adaptation-strategies" },
  { zh: "单元测试最佳实践", en: "unit-testing-best-practices" },
  { zh: "Redis缓存技术详解", en: "redis-caching-techniques" },
  { zh: "微服务架构设计", en: "microservices-architecture-design" },
  { zh: "GraphQL API设计", en: "graphql-api-design" },
  { zh: "Web安全防护指南", en: "web-security-guide" },
  { zh: "Jest测试框架实战", en: "jest-testing-framework" },
  { zh: "TypeScript泛型编程", en: "typescript-generics-programming" },
  { zh: "React性能优化技巧", en: "react-performance-tips" },
  { zh: "Node.js性能调优", en: "nodejs-performance-tuning" },
  { zh: "CSS动画实战指南", en: "css-animations-guide" },
  { zh: "Git工作流最佳实践", en: "git-workflow-best-practices" },
  { zh: "Kubernetes入门指南", en: "kubernetes-introduction" },
  { zh: "Docker Compose实战", en: "docker-compose-guide" },
  { zh: "Nginx配置详解", en: "nginx-configuration-guide" },
  { zh: "Shell脚本编程入门", en: "shell-scripting-guide" },
  { zh: "正则表达式精通", en: "regular-expressions-mastery" },
  { zh: "数据结构与算法", en: "data-structures-algorithms" },
  { zh: "设计模式详解", en: "design-patterns-explained" },
  { zh: "代码重构技巧", en: "code-refactoring-techniques" },
  { zh: "API接口设计", en: "api-interface-design" },
  { zh: "数据库设计原则", en: "database-design-principles" },
  { zh: "网络协议详解", en: "network-protocols-explained" }
];

const DRIP_MODE = process.env.DRIP_MODE === 'true';
const DRIP_COUNT = parseInt(process.env.DRIP_COUNT) || 5;

const technicalExperts = [
  { name: '张明远', title: '资深架构师', avatar: '👨‍💻', expertise: ['Python', 'JavaScript', '系统设计'] },
  { name: '李思雨', title: '前端技术总监', avatar: '👩‍💻', expertise: ['React', 'Vue', '性能优化'] },
  { name: '王浩然', title: 'DevOps专家', avatar: '🔧', expertise: ['Docker', 'Kubernetes', 'CI/CD'] },
  { name: '陈雨晴', title: '数据库专家', avatar: '💾', expertise: ['SQL', 'MongoDB', '性能调优'] },
];

const getRandomExpert = () => {
  return technicalExperts[Math.floor(Math.random() * technicalExperts.length)];
};

const generateArticle = (keyword) => {
  const safeKeyword = sanitizeKeyword(keyword.zh);
  const title = safeKeyword;
  const slug = keyword.en || 'article-' + Date.now();
  const expert = getRandomExpert();
  
  const painPoint = getPainPoint(safeKeyword);
  const coreConcept = getCoreConcept(safeKeyword);
  const tlDr = getTlDr(safeKeyword);
  
  const content = `# ${title}

## 📝 TL;DR

> **${tlDr}**

---

## 🔍 痛点分析

${painPoint}

---

## 🎯 核心概念

${coreConcept}

---

## 💡 学习路径

### 入门阶段

建议从基础概念开始学习：
- 理解核心原理和基本概念
- 掌握基础语法和常用API
- 通过简单项目实践巩固知识

### 进阶阶段

在掌握基础后，可以深入学习：
- 高级特性和最佳实践
- 性能优化和调试技巧
- 框架源码和设计模式

### 实战应用

通过实际项目提升技能：
- 参与开源项目贡献
- 独立开发完整项目
- 解决实际业务问题

---

## ⚠️ 常见误区

### ❌ 错误做法

\`\`\`javascript
${getBadCodeExample(safeKeyword)}
\`\`\`

### ✅ 正确做法

\`\`\`javascript
${getGoodCodeExample(safeKeyword)}
\`\`\`

---

## 📊 复杂度对比

| 维度 | 初级水平 | 中级水平 | 高级水平 |
|------|---------|---------|---------|
| 掌握程度 | 基础语法 | 熟练应用 | 深度理解 |
| 代码质量 | 能运行 | 可维护 | 优雅高效 |
| 问题解决 | 依赖搜索 | 独立解决 | 预判预防 |
| 架构设计 | 无概念 | 模块划分 | 系统设计 |

---

## 🛠️ 工具推荐

| 工具名称 | 主要用途 | 适用场景 |
|---------|---------|---------|
| 官方文档 | 学习和查阅 | 日常开发参考 |
| 在线教程 | 系统学习 | 入门和进阶 |
| 开发工具 | 编码调试 | 日常开发 |
| 代码托管 | 版本控制 | 团队协作 |

---

## 💡 关键要点

- **核心原则**：${getKeyPoint(safeKeyword)}
- **实践建议**：从简单项目开始，逐步积累经验
- **学习资源**：官方文档 > 视频教程 > 技术博客

---

## 📚 推荐阅读

${getRelatedArticles(safeKeyword)}

---

希望本文对你的学习有所帮助！如果有任何问题或建议，欢迎交流讨论。
`;

  const description = `本文将从基础概念入手，为你系统地介绍${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '').replace('入门', '')}的相关知识和实践经验，帮助你快速掌握核心技能。`;
  
  const affiliateUrls = [
    { url: 'https://vercel.com/signup', text: '免费部署你的项目' },
    { url: 'https://www.jetbrains.com/webstorm/', text: '专业开发工具' },
    { url: 'https://github.com/', text: '代码托管平台' },
    { url: 'https://www.docker.com/', text: '容器化部署' }
  ];
  const affiliate = affiliateUrls[Math.floor(Math.random() * affiliateUrls.length)];
  
  return {
    title,
    slug,
    content,
    description,
    date: new Date().toISOString().split('T')[0],
    tags: ['技术', '编程', '开发', '学习'],
    author: expert.name,
    authorTitle: expert.title,
    authorAvatar: expert.avatar,
    tlDr: tlDr,
    painPoint: painPoint,
    coreConcept: coreConcept,
    affiliateUrl: affiliate.url,
    affiliateCtaText: affiliate.text
  };
};

const getPainPoint = (keyword) => {
  const pains = {
    'Python': '很多初学者在学习Python时，往往陷入"只会写Hello World"的困境，不知道如何将知识应用到实际项目中。',
    'JavaScript': 'JavaScript的异步编程、闭包等概念让很多新手感到困惑，调试起来更是无从下手。',
    'React': 'React的生命周期、Hooks使用规则常常让开发者踩坑，组件通信更是难点。',
    'Node.js': '异步IO、事件循环、内存管理等概念理解不透彻，导致生产环境频繁出现问题。',
    'CSS': '布局问题、响应式适配、浏览器兼容性一直是前端开发者的痛点。',
    'Git': '分支管理、冲突解决、版本回退等操作让很多开发者头疼。',
    'Docker': '容器网络、数据持久化、镜像优化等知识点容易混淆。',
    'SQL': '复杂查询优化、索引设计、事务处理是数据库开发的难点。',
    'TypeScript': '类型推断、泛型、类型体操等高级特性学习曲线较陡。',
    'Vue': '响应式原理、组合式API、状态管理需要深入理解。',
    'Linux': '命令行操作、权限管理、服务配置对新手不够友好。',
    'HTTP': '状态码、缓存机制、HTTPS原理等知识容易被忽略。',
    'RESTful': 'API设计规范、版本控制、错误处理缺乏统一标准。',
    '性能优化': '性能瓶颈定位、加载优化、运行时优化需要系统方法论。',
    '算法': '时间复杂度、空间复杂度分析以及常见算法的灵活运用是难点。',
    'MongoDB': '数据建模、索引优化、聚合管道等概念需要深入理解。',
    'Webpack': '配置繁琐、性能优化、Tree Shaking等特性不易掌握。',
    'ES6': '箭头函数、解构赋值、Promise等新特性需要熟练运用。',
    '移动端': '响应式布局、触摸事件、性能优化等挑战较多。',
    '单元测试': '测试覆盖率、Mock技巧、测试策略等需要系统学习。'
  };
  
  const matchedKey = Object.keys(pains).find(key => keyword.includes(key));
  return matchedKey ? pains[matchedKey] : '学习编程技术的过程中，很多开发者都会遇到各种挑战和困惑。';
};

const getCoreConcept = (keyword) => {
  const concepts = {
    'Python': 'Python是一种高级通用编程语言，以简洁的语法和强大的生态系统著称。它支持多种编程范式，包括面向对象、函数式和过程式编程。',
    'JavaScript': 'JavaScript是Web开发的核心语言，支持事件驱动和异步编程。它是一种动态类型语言，具有闭包、原型继承等特性。',
    'React': 'React是Facebook开发的用于构建用户界面的JavaScript库，采用组件化和虚拟DOM技术，支持单向数据流。',
    'Node.js': 'Node.js是基于Chrome V8引擎的JavaScript运行时，允许在服务器端运行JavaScript，支持非阻塞I/O。',
    'CSS': 'CSS是用于描述网页样式的语言，包括布局、颜色、字体等。CSS3引入了Flexbox、Grid等现代布局技术。',
    'Git': 'Git是分布式版本控制系统，支持分支管理、代码合并、版本回退等操作，是团队协作的必备工具。',
    'Docker': 'Docker是容器化平台，允许将应用程序及其依赖打包成容器，实现环境一致性和快速部署。',
    'SQL': 'SQL是用于管理关系型数据库的标准语言，支持数据查询、插入、更新和删除操作。',
    'TypeScript': 'TypeScript是JavaScript的超集，添加了静态类型系统，提供更好的开发体验和代码维护性。',
    'Vue': 'Vue是渐进式JavaScript框架，以易学易用著称，支持响应式数据绑定和组件化开发。',
    'Linux': 'Linux是开源操作系统内核，广泛用于服务器环境，具有稳定性高、安全性强等特点。',
    'HTTP': 'HTTP是超文本传输协议，是Web通信的基础，支持请求-响应模式和多种方法（GET、POST等）。',
    'RESTful': 'REST是一种软件架构风格，强调无状态、统一接口、资源导向等原则，是API设计的主流标准。',
    '性能优化': '性能优化是提升系统响应速度和资源利用率的过程，包括代码优化、缓存策略、加载优化等方面。',
    '算法': '算法是解决问题的步骤集合，包括排序、查找、图论等多种类型，是编程的核心基础。',
    'MongoDB': 'MongoDB是NoSQL文档数据库，采用JSON格式存储数据，支持灵活的数据模型和水平扩展。',
    'Webpack': 'Webpack是现代前端构建工具，支持模块打包、代码分割、热更新等功能。',
    'ES6': 'ES6是JavaScript的第六版标准，引入了箭头函数、Promise、类等众多新特性。',
    '移动端': '移动端开发涉及iOS和Android平台，需要考虑屏幕适配、性能优化、用户体验等方面。',
    '单元测试': '单元测试是对软件最小可测试单元的验证，确保代码的正确性和可维护性。'
  };
  
  const matchedKey = Object.keys(concepts).find(key => keyword.includes(key));
  return matchedKey ? concepts[matchedKey] : '这是一项重要的编程技术，在现代软件开发中发挥着关键作用。';
};

const getTlDr = (keyword) => {
  const summaries = {
    'Python': 'Python入门不难，但要写出优雅高效的代码需要理解其核心特性和最佳实践。',
    'JavaScript': '掌握JavaScript的异步编程模型和闭包机制是成为优秀前端开发者的关键。',
    'React': 'React的核心在于组件化思维和状态管理，掌握Hooks可以大幅提升开发效率。',
    'Node.js': 'Node.js的事件循环和异步IO是其高性能的关键，理解它才能写出高效的服务端代码。',
    'CSS': '现代CSS布局技术（Flexbox、Grid）可以轻松实现复杂的响应式设计。',
    'Git': '良好的Git工作流可以提高团队协作效率，减少代码冲突。',
    'Docker': '容器化可以解决开发环境与生产环境不一致的问题，实现一次构建处处运行。',
    'SQL': '良好的数据库设计和查询优化是高性能应用的基础。',
    'TypeScript': 'TypeScript的类型系统可以在开发阶段发现潜在错误，提高代码质量。',
    'Vue': 'Vue的响应式原理和组合式API让前端开发更加直观和高效。',
    'Linux': '掌握Linux命令行是后端开发者的必备技能，可以提高工作效率。',
    'HTTP': '理解HTTP协议的工作原理有助于排查网络问题和优化API设计。',
    'RESTful': '良好的RESTful API设计可以提高接口的可维护性和易用性。',
    '性能优化': '性能优化需要系统性思维，从加载、渲染、运行等多个维度入手。',
    '算法': '算法能力是程序员的核心竞争力，需要持续学习和实践。',
    'MongoDB': 'NoSQL数据库适合处理非结构化数据，具有良好的扩展性。',
    'Webpack': '合理配置Webpack可以优化前端构建流程和产物大小。',
    'ES6': 'ES6+的新特性可以让代码更加简洁优雅，提高开发效率。',
    '移动端': '移动端开发需要关注用户体验和性能，适配各种设备和网络环境。',
    '单元测试': '良好的测试覆盖率可以提高代码质量，减少回归问题。'
  };
  
  const matchedKey = Object.keys(summaries).find(key => keyword.includes(key));
  return matchedKey ? summaries[matchedKey] : '本文介绍了一项重要的编程技术及其学习路径。';
};

const getBadCodeExample = (keyword) => {
  if (keyword.includes('Python')) {
    return `# 低效的列表遍历
result = []
for item in my_list:
    if item % 2 == 0:
        result.append(item * 2)
return result`;
  }
  if (keyword.includes('JavaScript')) {
    return `// 回调地狱
fetch('/api/data', (err, data) => {
  if (err) throw err;
  processData(data, (err, result) => {
    if (err) throw err;
    displayResult(result);
  });
});`;
  }
  if (keyword.includes('React')) {
    return `// 错误：在循环中使用索引作为key
{items.map((item, index) => (
  <Component key={index} data={item} />
))}`;
  }
  return `// 低效的代码示例
function processData(items) {
  var result = [];
  for (var i = 0; i < items.length; i++) {
    result.push(items[i] * 2);
  }
  return result;
}`;
};

const getGoodCodeExample = (keyword) => {
  if (keyword.includes('Python')) {
    return `# 使用列表推导式，简洁高效
result = [item * 2 for item in my_list if item % 2 == 0]
return result`;
  }
  if (keyword.includes('JavaScript')) {
    return `// 使用async/await，代码更清晰
async function fetchData() {
  const data = await fetch('/api/data');
  const result = await processData(data);
  displayResult(result);
}`;
  }
  if (keyword.includes('React')) {
    return `// 正确：使用唯一ID作为key
{items.map((item) => (
  <Component key={item.id} data={item} />
))}`;
  }
  return `// 高效的代码示例
const processData = (items) => 
  items.map(item => item * 2);`;
};

const getKeyPoint = (keyword) => {
  const points = {
    'Python': 'Python之禅：优美胜于丑陋，显式胜于隐式，简单胜于复杂。',
    'JavaScript': '一切皆对象，函数是一等公民，异步编程是核心。',
    'React': '数据驱动视图，单向数据流，组件化开发。',
    'Node.js': '单线程、非阻塞、事件驱动是Node.js的核心特性。',
    'CSS': '分离关注点，使用语义化选择器，避免!important。',
    'Git': '频繁提交，使用有意义的提交信息，定期同步远程仓库。',
    'Docker': '容器应该是无状态的，数据应该挂载外部存储。',
    'SQL': '避免SELECT *，合理使用索引，注意事务隔离级别。',
    'TypeScript': '尽可能使用严格模式，合理使用类型推断。',
    'Vue': '响应式数据、组件通信、生命周期钩子是核心。',
    'Linux': '一切皆文件，权限控制是安全的基础。',
    'HTTP': '无状态协议，使用适当的缓存策略。',
    'RESTful': '使用合适的HTTP方法，统一错误处理。',
    '性能优化': '测量优先，找出瓶颈再优化。',
    '算法': '时间复杂度优先于代码简洁度。',
    'MongoDB': '合理设计数据模型，创建适当的索引。',
    'Webpack': '代码分割可以显著减少首屏加载时间。',
    'ES6': '使用const/let代替var，优先使用箭头函数。',
    '移动端': '响应式设计，懒加载，图片优化。',
    '单元测试': '测试应该是独立的、可重复的、快速的。'
  };
  
  const matchedKey = Object.keys(points).find(key => keyword.includes(key));
  return matchedKey ? points[matchedKey] : '掌握核心概念，注重实践应用。';
};

const getRelatedArticles = (keyword) => {
  const related = {
    'Python': ['《Python异步编程指南》', '《Python设计模式详解》', '《Django框架实战》'],
    'JavaScript': ['《ES6+新特性详解》', '《Promise与async/await入门》', '《JavaScript性能优化》'],
    'React': ['《React Hooks完全指南》', '《Redux状态管理详解》', '《React性能优化实战》'],
    'Node.js': ['《Express框架入门》', '《Node.js性能调优》', '《Socket.IO实时通信》'],
    'CSS': ['《Flexbox布局完全指南》', '《CSS Grid布局详解》', '《CSS动画实战》'],
    'Git': ['《Git工作流最佳实践》', '《代码审查流程》', '《GitHub协作指南》'],
    'Docker': ['《Docker Compose实战》', '《Kubernetes入门》', '《CI/CD流水线搭建》'],
    'SQL': ['《SQL查询优化技巧》', '《数据库索引设计》', '《事务处理详解》'],
    'TypeScript': ['《TypeScript类型体操》', '《泛型编程入门》', '《与React配合使用》'],
    'Vue': ['《Vue3组合式API详解》', '《Pinia状态管理》', '《Vue Router实战》'],
    'Linux': ['《Shell脚本编程》', '《服务器运维基础》', '《Nginx配置详解》'],
    'HTTP': ['《HTTPS原理详解》', '《HTTP缓存策略》', '《RESTful API设计》'],
    'RESTful': ['《API版本控制》', '《GraphQL入门》', '《API安全防护》'],
    '性能优化': ['《Web性能优化指南》', '《首屏加载优化》', '《懒加载实现》'],
    '算法': ['《排序算法详解》', '《动态规划入门》', '《LeetCode刷题指南》'],
    'MongoDB': ['《MongoDB数据建模》', '《聚合管道实战》', '《MongoDB性能优化》'],
    'Webpack': ['《Vite构建工具入门》', '《Tree Shaking详解》', '《代码分割策略》'],
    'ES6': ['《解构赋值详解》', '《模块化开发》', '《Promise链式调用》'],
    '移动端': ['《响应式设计指南》', '《触摸事件处理》', '《PWA开发实战》'],
    '单元测试': ['《Jest测试框架》', '《测试覆盖率指南》', '《Mock技术详解》']
  };
  
  const matchedKey = Object.keys(related).find(key => keyword.includes(key));
  const articles = matchedKey ? related[matchedKey] : ['《编程入门指南》', '《开发最佳实践》', '《技术学习路线》'];
  return articles.map(article => `- 📖 ${article}`).join('\n');
};

const sanitizeKeyword = (keyword) => {
  const forbiddenChars = /[<>:"/\\|?*\x00-\x1F]/g;
  return keyword.replace(forbiddenChars, '');
};

const logValidationResult = (keyword, validation) => {
  if (!validation.isSafe) {
    console.log(`❌ [硬拦截] "${keyword}"`);
    validation.hardBlock.forEach(issue => console.log(`   - ${issue}`));
  } else if (validation.needsReview) {
    console.log(`⚠️ [待审核] "${keyword}"`);
    validation.softBlock.forEach(issue => console.log(`   - ${issue}`));
    if (validation.ymyl.length > 0) {
      validation.ymyl.forEach(issue => console.log(`   - ${issue}`));
    }
  } else {
    console.log(`✅ [安全] "${keyword}"`);
  }
};

const main = async () => {
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(REJECTED_DIR);
  
  let stats = {
    generated: 0,
    blocked: 0,
    reviewed: 0
  };

  let keywordsToProcess = keywords;
  
  if (DRIP_MODE) {
    console.log(`🌧️ 滴灌模式已启用，本次生成 ${DRIP_COUNT} 篇文章`);
    const shuffled = [...keywordsToProcess].sort(() => Math.random() - 0.5);
    keywordsToProcess = shuffled.slice(0, DRIP_COUNT);
  }

  for (const keyword of keywordsToProcess) {
    const existingFiles = await fs.readdir(OUTPUT_DIR);
    const exists = existingFiles.some(file => file === `${keyword.en}.md`);
    
    if (exists) {
      console.log(`⚠️ 跳过已存在的文章: ${keyword.zh}`);
      continue;
    }
    
    const article = generateArticle(keyword);
    const validation = await validateAndFilter(article.content);
    
    logValidationResult(keyword.zh, validation);
    
    if (!validation.isSafe) {
      const rejectedContent = matter.stringify(article.content, {
        ...article,
        validationStatus: 'REJECTED',
        rejectionReasons: validation.hardBlock
      });
      await fs.writeFile(
        path.join(REJECTED_DIR, `${article.slug}.md`),
        rejectedContent,
        'utf-8'
      );
      stats.blocked++;
      continue;
    }

    const frontmatter = {
      title: article.title,
      description: article.description,
      date: article.date,
      slug: article.slug,
      tags: article.tags,
      generated: new Date().toISOString(),
      validationStatus: validation.needsReview ? 'REVIEW' : 'APPROVED',
      needsHumanReview: validation.needsReview,
      ymylContent: validation.ymyl
    };
    
    const markdown = matter.stringify(article.content, frontmatter);
    const filePath = path.join(OUTPUT_DIR, `${article.slug}.md`);
    
    await fs.writeFile(filePath, markdown, 'utf-8');
    
    if (validation.needsReview) {
      stats.reviewed++;
    } else {
      stats.generated++;
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ 已生成并通过验证: ${stats.generated}`);
  console.log(`⚠️ 待人工审核: ${stats.reviewed}`);
  console.log(`❌ 已拦截并移至回收站: ${stats.blocked}`);
  console.log(`${'='.repeat(60)}`);
  
  if (stats.blocked > 0) {
    console.log(`\n📁 被拦截的文件已保存至: ${REJECTED_DIR}/`);
  }
  
  if (stats.reviewed > 0) {
    console.log(`\n⚠️ 有 ${stats.reviewed} 篇文章需要人工审核`);
  }
};

main().catch(console.error);