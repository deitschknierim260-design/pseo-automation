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
  
  const learnPoints = getLearningPoints(safeKeyword);
  const coreContent = getCoreContent(safeKeyword);
  const comparisonData = getComparisonData(safeKeyword);
  const resources = getResources(safeKeyword);
  const cta = getCTA(safeKeyword);
  
  const content = `# ${title}

## 🎯 你将学到什么

${learnPoints}

---

## 💡 核心概念详解

${coreContent}

---

## ⚖️ 方案对比

${comparisonData}

---

## 📚 推荐学习资源

${resources}

---

## 🚀 下一步

${cta}

---

希望本文对你的学习有所帮助！如果有任何问题或建议，欢迎交流讨论。
`;

  const description = `本文将从基础概念入手，为你系统地介绍${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '').replace('入门', '')}的相关知识和实践经验，帮助你快速掌握核心技能。`;
  
  let affiliateUrl, affiliateCtaText;
  
  const deploymentKeywords = ['Docker', 'Kubernetes', 'Nginx', '部署', '容器', '云服务'];
  const isDeploymentTopic = deploymentKeywords.some(keyword => safeKeyword.includes(keyword));
  
  if (isDeploymentTopic) {
    affiliateUrl = 'https://www.vultr.com/?ref=9903747';
    if (safeKeyword.includes('Docker')) {
      affiliateCtaText = '部署Docker容器，Vultr高性能云服务器';
    } else if (safeKeyword.includes('Kubernetes') || safeKeyword.includes('K8s')) {
      affiliateCtaText = 'K8s集群部署，Vultr云主机优惠';
    } else if (safeKeyword.includes('Nginx')) {
      affiliateCtaText = 'Nginx服务器配置，Vultr专属优惠';
    } else {
      affiliateCtaText = '云服务器部署，Vultr新用户优惠';
    }
  } else {
    affiliateUrl = 'https://m.do.co/c/c9c6aa51c904';
    if (safeKeyword.includes('Python')) {
      affiliateCtaText = 'Python项目部署，DigitalOcean云服务器';
    } else if (safeKeyword.includes('JavaScript') || safeKeyword.includes('JS')) {
      affiliateCtaText = 'JS应用托管，DigitalOcean优惠';
    } else if (safeKeyword.includes('React')) {
      affiliateCtaText = 'React应用部署，DigitalOcean入门';
    } else if (safeKeyword.includes('TypeScript') || safeKeyword.includes('TS')) {
      affiliateCtaText = 'TypeScript项目，DigitalOcean云服务';
    } else if (safeKeyword.includes('SQL') || safeKeyword.includes('数据库')) {
      affiliateCtaText = '数据库服务器，DigitalOcean优惠';
    } else if (safeKeyword.includes('安全')) {
      affiliateCtaText = '安全服务器配置，DigitalOcean';
    } else if (safeKeyword.includes('Git') || safeKeyword.includes('版本控制')) {
      affiliateCtaText = 'Git仓库托管，DigitalOcean云主机';
    } else {
      affiliateCtaText = '开始你的项目，DigitalOcean新用户$200额度';
    }
  }
  
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
    affiliateUrl,
    affiliateCtaText
  };
};

const getLearningPoints = (keyword) => {
  const points = {
    'Python': `- Python基础语法和数据类型
- 函数定义和模块化编程
- 文件操作和异常处理
- 常用标准库的使用
**预计学习时间：10小时**`,
    'JavaScript': `- JavaScript核心语法和ES6+新特性
- 异步编程（Promise/async-await）
- 闭包和作用域原理
- DOM操作和事件处理
**预计学习时间：12小时**`,
    'React': `- React组件化开发思想
- Hooks的正确使用方式
- 状态管理和数据流
- React性能优化技巧
**预计学习时间：15小时**`,
    'Node.js': `- Node.js事件循环原理
- Express/Koa框架使用
- 数据库连接和ORM
- API接口设计规范
**预计学习时间：12小时**`,
    'CSS': `- Flexbox和Grid布局
- 响应式设计实现
- CSS动画和过渡效果
- 浏览器兼容性处理
**预计学习时间：8小时**`,
    'Git': `- Git基本操作和分支管理
- 工作流最佳实践
- 冲突解决和代码审查
- GitHub协作技巧
**预计学习时间：6小时**`,
    'Docker': `- Docker容器基础概念
- Dockerfile编写规范
- Docker Compose编排
- 镜像优化和安全
**预计学习时间：10小时**`,
    'SQL': `- SQL基本查询语法
- 索引设计和优化
- 事务处理和锁机制
- 数据库设计范式
**预计学习时间：10小时**`,
    'TypeScript': `- TypeScript类型系统
- 泛型编程技巧
- 类型体操进阶
- 与React/Vue配合使用
**预计学习时间：10小时**`,
    'Vue': `- Vue3组合式API
- 响应式原理深入
- Pinia状态管理
- Vue Router路由
**预计学习时间：12小时**`,
    'Linux': `- Linux命令行基础
- 文件权限管理
- Shell脚本编写
- 服务配置和管理
**预计学习时间：8小时**`,
    'HTTP': `- HTTP协议原理
- RESTful API设计
- 缓存策略和CDN
- HTTPS和安全
**预计学习时间：6小时**`,
    'RESTful': `- RESTful设计原则
- API版本控制
- 错误处理规范
- API文档编写
**预计学习时间：6小时**`,
    '性能优化': `- Web性能指标体系
- 首屏加载优化
- 运行时性能优化
- 监控和分析工具
**预计学习时间：8小时**`,
    '算法': `- 常见数据结构
- 排序和查找算法
- 动态规划入门
- 复杂度分析方法
**预计学习时间：20小时**`,
    'MongoDB': `- MongoDB数据建模
- 查询优化技巧
- 聚合管道实战
- 索引设计策略
**预计学习时间：10小时**`,
    'Webpack': `- Webpack核心概念
- 配置优化策略
- 代码分割和懒加载
- 开发服务器配置
**预计学习时间：8小时**`,
    'ES6': `- ES6+新特性详解
- 箭头函数和解构
- Promise和异步处理
- 模块化开发规范
**预计学习时间：6小时**`,
    '移动端': `- 响应式布局实现
- 触摸事件处理
- 移动端性能优化
- PWA开发实战
**预计学习时间：10小时**`,
    '单元测试': `- 测试框架选择和配置
- 测试覆盖率策略
- Mock技术详解
- TDD开发模式
**预计学习时间：8小时**`,
    'Redis': `- Redis数据结构
- 缓存策略设计
- 分布式锁实现
- 性能优化技巧
**预计学习时间：8小时**`,
    'Kubernetes': `- Kubernetes核心概念
- Pod和Service配置
- 部署策略和扩缩容
- 网络和存储管理
**预计学习时间：15小时**`,
    'Nginx': `- Nginx配置基础
- 反向代理和负载均衡
- 静态资源优化
- HTTPS配置
**预计学习时间：6小时**`,
    'Jest': `- Jest测试框架配置
- 单元测试编写
- 快照测试和Mock
- 测试覆盖率报告
**预计学习时间：6小时**`,
    'Web安全': `- XSS和CSRF防护
- SQL注入防范
- 认证和授权机制
- 安全最佳实践
**预计学习时间：8小时**`
  };
  
  const matchedKey = Object.keys(points).find(key => keyword.includes(key));
  return matchedKey ? points[matchedKey] : `- 核心概念理解
- 实践技能掌握
- 最佳实践学习
**预计学习时间：8小时**`;
};

const getCoreContent = (keyword) => {
  const contents = {
    'Python': `Python是一种高级通用编程语言，以简洁的语法和强大的生态系统著称。它由Guido van Rossum于1991年发布，如今已成为最受欢迎的编程语言之一，广泛应用于Web开发、数据分析、人工智能、科学计算等领域。

### 核心概念

Python的设计哲学强调代码可读性和简洁性，其语法清晰直观，使得开发者能够用更少的代码表达更多的逻辑。Python支持多种编程范式，包括面向对象、函数式、过程式和面向切面编程。

### 实战代码示例一：异步编程

\`\`\`python
# 使用asyncio和aiohttp进行并发API请求
import asyncio
import aiohttp
from typing import List, Dict, Any

async def fetch_data(session: aiohttp.ClientSession, url: str) -> Dict[str, Any]:
    """异步获取单URL数据"""
    async with session.get(url) as response:
        if response.status != 200:
            raise ValueError(f"HTTP error {response.status}")
        return await response.json()

async def fetch_all(urls: List[str]) -> List[Dict[str, Any]]:
    """并发获取多个URL数据"""
    async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
        tasks = [fetch_data(session, url) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        return [r for r in results if not isinstance(r, Exception)]

# 使用示例
async def main():
    api_urls = [
        'https://api.github.com/users/octocat',
        'https://api.github.com/repos/python/cpython',
        'https://api.github.com/events'
    ]
    data = await fetch_all(api_urls)
    for item in data:
        print(f"获取数据: {list(item.keys())[:3]}...")

if __name__ == '__main__':
    asyncio.run(main())
\`\`\`

### 实战代码示例二：数据处理与分析

\`\`\`python
# 使用pandas进行数据分析
import pandas as pd
import numpy as np

# 创建DataFrame
data = {
    '日期': pd.date_range('2024-01-01', periods=10),
    '销售额': [1200, 1500, 1300, 1800, 2000, 1700, 1900, 2200, 2100, 2500],
    '访客数': [200, 250, 220, 300, 350, 280, 320, 380, 360, 420],
    '转化率': [3.5, 4.2, 3.8, 4.5, 5.1, 4.8, 4.9, 5.5, 5.3, 6.0]
}

df = pd.DataFrame(data)

# 数据清洗和处理
df['客单价'] = df['销售额'] / df['访客数']
df['同比增长'] = df['销售额'].pct_change() * 100
df['周几'] = df['日期'].dt.day_name()

# 数据分析
summary = df.agg({
    '销售额': ['sum', 'mean', 'max', 'min'],
    '访客数': ['sum', 'mean'],
    '转化率': ['mean', 'max']
})

print("数据摘要统计:")
print(summary.round(2))

# 数据筛选
high_performance = df[df['转化率'] > 5.0]
print(f"\n转化率超过5%的日期数: {len(high_performance)}")
\`\`\`

### 实战代码示例三：装饰器与元编程

\`\`\`python
# 实用装饰器示例
import time
from functools import wraps
from typing import Callable, Any

def timing_decorator(func: Callable[..., Any]) -> Callable[..., Any]:
    """测量函数执行时间的装饰器"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter()
        result = func(*args, **kwargs)
        end_time = time.perf_counter()
        execution_time = end_time - start_time
        print(f"函数 {func.__name__} 执行耗时: {execution_time:.4f} 秒")
        return result
    return wrapper

def retry_decorator(max_retries: int = 3, delay: float = 1.0):
    """重试装饰器"""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    time.sleep(delay * (2 ** attempt))  # 指数退避
            raise last_exception
        return wrapper
    return decorator

def validate_input(*validations):
    """输入验证装饰器"""
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        @wraps(func)
        def wrapper(*args, **kwargs):
            for i, validation in enumerate(validations):
                if i < len(args):
                    if not validation(args[i]):
                        raise ValueError(f"参数 {i+1} 验证失败")
            return func(*args, **kwargs)
        return wrapper
    return decorator

# 使用示例
@timing_decorator
@retry_decorator(max_retries=2, delay=0.5)
@validate_input(lambda x: x > 0, lambda y: isinstance(y, str))
def process_data(value: int, name: str) -> str:
    """处理数据的示例函数"""
    time.sleep(0.1)
    return f"处理完成: {name} = {value * 2}"

# 测试装饰器
result = process_data(42, "test")
print(result)
\`\`\`

### 核心特性详解

1. **动态类型系统**：Python是动态类型语言，变量类型在运行时确定，这使得代码更加灵活，但也需要开发者更加注意类型检查。

2. **自动内存管理**：Python使用引用计数和垃圾回收机制自动管理内存，开发者无需手动分配和释放内存。

3. **丰富的标准库**：Python的标准库非常丰富，涵盖了网络通信、文件操作、数据处理、正则表达式、并发编程等几乎所有常见需求。

4. **跨平台性**：Python代码可以在Windows、Linux、macOS等多种操作系统上运行，真正实现"一次编写，多处运行"。

5. **强大的生态系统**：Python拥有庞大的第三方库生态，包括NumPy、Pandas、TensorFlow、Django、Flask等知名库，能够满足各种开发需求。

6. **社区支持**：Python拥有全球最大的开发者社区之一，有大量的教程、文档和开源项目可供学习和参考。

### 学习建议

学习Python时，建议从基础语法开始，掌握数据类型、控制结构、函数定义等基础知识。然后可以根据兴趣方向深入学习，比如Web开发可以学习Django或Flask框架，数据分析可以学习NumPy和Pandas，机器学习可以学习Scikit-learn和TensorFlow。

实践是学习编程的最佳方式，建议多写代码、多做项目，从简单的脚本开始，逐步挑战更复杂的任务。
`,
    'JavaScript': `JavaScript是Web开发的核心语言，是一门具有函数式编程特性的动态脚本语言。它由Brendan Eich在1995年创造，最初仅用于浏览器端的简单交互，如今已发展成为全栈开发的主流语言，可用于前端、后端、移动应用甚至物联网开发。

### 核心概念

JavaScript是单线程语言，但通过事件循环机制实现了异步编程。它支持面向对象、函数式和原型式编程范式，具有动态类型、闭包、高阶函数等特性。

### 实战代码示例一：异步编程与并发处理

\`\`\`javascript
// 使用Promise.all处理并发请求
async function fetchMultipleResources() {
  try {
    const [user, posts, comments] = await Promise.all([
      fetch('/api/user').then(res => {
        if (!res.ok) throw new Error('用户数据获取失败');
        return res.json();
      }),
      fetch('/api/posts').then(res => res.json()),
      fetch('/api/comments').then(res => res.json())
    ]);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('获取资源失败:', error.message);
    throw error;
  }
}

// 使用Promise.allSettled处理部分失败的情况
async function fetchWithFallback() {
  const results = await Promise.allSettled([
    fetch('/api/critical-data'),
    fetch('/api/optional-data'),
    fetch('/api/logging-endpoint')
  ]);
  
  const successfulResults = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
    
  const failedCount = results.filter(r => r.status === 'rejected').length;
  
  console.log(\`成功: \${successfulResults.length}, 失败: \${failedCount}\`);
  return successfulResults;
}
\`\`\`

### 实战代码示例二：ES6+特性与现代语法

\`\`\`javascript
// 解构赋值与默认值
const user = {
  name: 'John',
  age: 30,
  address: { city: 'New York', country: 'USA' }
};

const { name, age, address: { city } } = user;
const { email = 'default@example.com' } = user;

// 可选链与空值合并
const userName = user?.profile?.name ?? 'Guest';
const config = settings?.api ?? { url: '/api' };

// 箭头函数与高阶函数
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
const sum = numbers.reduce((acc, n) => acc + n, 0);
const evens = numbers.filter(n => n % 2 === 0);

// 模板字面量
const greeting = \`Hello \${name}, you are \${age} years old and live in \${city}\`;

// 展开运算符
const arr1 = [1, 2, 3];
const arr2 = [...arr1, 4, 5, 6];
const merged = { ...user, age: 31 };

// Promise链式调用
fetch('/api/data')
  .then(res => res.json())
  .then(data => processData(data))
  .catch(error => handleError(error))
  .finally(() => cleanup());
\`\`\`

### 实战代码示例三：类与模块化

\`\`\`javascript
// 类定义与继承
class BaseService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.cache = new Map();
  }
  
  async fetch(endpoint) {
    const cacheKey = \`\${this.apiUrl}\${endpoint}\`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const response = await fetch(\`\${this.apiUrl}\${endpoint}\`);
    const data = await response.json();
    this.cache.set(cacheKey, data);
    
    return data;
  }
}

class UserService extends BaseService {
  constructor() {
    super('https://api.example.com');
  }
  
  async getUserById(userId) {
    return this.fetch(\`/users/\${userId}\`);
  }
  
  async getUsersByRole(role) {
    const users = await this.fetch('/users');
    return users.filter(user => user.role === role);
  }
}

// ES模块导出与导入
// utils.js
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('zh-CN').format(date);
};

export const debounce = (fn, delay) => {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

// app.js
import { formatDate, debounce } from './utils.js';

const formatted = formatDate(new Date());
const debouncedSearch = debounce(search, 300);
\`\`\`

### 实战代码示例四：异步迭代与生成器

\`\`\`javascript
// 异步迭代器
async function* generateNumbers(count) {
  for (let i = 0; i < count; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

// 使用for-await-of
async function processNumbers() {
  for await (const num of generateNumbers(5)) {
    console.log(\`Number: \${num}\`);
  }
}

// Generator函数
function* fibonacci() {
  let [prev, curr] = [0, 1];
  while (true) {
    yield curr;
    [prev, curr] = [curr, prev + curr];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
console.log(fib.next().value); // 3
\`\`\`

### 核心特性详解

1. **单线程事件循环**：JavaScript是单线程的，所有代码都在主线程上执行。事件循环机制负责处理异步操作，包括宏任务（setTimeout, setInterval）和微任务（Promise.then, MutationObserver）。

2. **闭包**：函数可以访问其词法作用域中的变量，即使函数在其词法作用域之外执行。这是JavaScript中非常强大的特性，常用于数据封装和模块模式。

3. **原型继承**：JavaScript使用原型链实现继承，每个对象都有一个原型对象，通过\`__proto__\`属性指向。ES6引入了class语法糖，但底层仍然是原型继承。

4. **动态类型**：JavaScript是动态类型语言，变量的类型在运行时确定，可以随时改变类型。这提供了灵活性，但也需要开发者更加注意类型检查。

5. **高阶函数**：函数可以作为参数传递，也可以作为返回值返回。这使得函数式编程成为可能，支持map、filter、reduce等高阶函数。

6. **模块化**：ES6模块系统提供了import/export语法，支持模块化开发，提高代码的可维护性和复用性。

### 学习建议

学习JavaScript时，建议先掌握基础语法，包括变量、函数、控制结构等。然后深入学习异步编程、闭包、原型链等核心概念。ES6+的新特性如箭头函数、解构赋值、Promise、async/await等是现代JavaScript开发的必备知识。

实践项目是学习的关键，可以从简单的DOM操作开始，逐步构建完整的Web应用。同时，了解JavaScript的运行机制和性能优化技巧也是成为高级开发者的必经之路。`,
    'React': `React是Facebook开发的用于构建用户界面的JavaScript库，于2013年首次发布。它采用组件化和虚拟DOM技术，以其高效的渲染性能和灵活的开发模式而闻名，是当前最流行的前端框架之一。

### 核心概念

React的核心思想是将UI拆分为独立的、可复用的组件，每个组件管理自己的状态和渲染逻辑。通过虚拟DOM实现高效的DOM更新，通过单向数据流保证数据流向的清晰性。

### 实战代码示例一：带状态管理的用户资料组件

\`\`\`jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
}

interface UserProfileProps {
  userId: string;
  onUserLoaded?: (user: User) => void;
}

function UserProfile({ userId, onUserLoaded }: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<User>(`/api/users/${userId}`);
      setUser(response.data);
      onUserLoaded?.(response.data);
    } catch (err) {
      setError('Failed to fetch user data');
      console.error('User fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, onUserLoaded]);

  useEffect(() => {
    const timer = setTimeout(fetchUser, 100);
    return () => clearTimeout(timer);
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      document.title = `${user.name} - Profile`;
    }
  }, [user]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchUser} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img 
          src={user.avatar} 
          alt={`${user.name} avatar`}
          className="avatar"
        />
        <div className="user-info">
          <h1 className="user-name">{user.name}</h1>
          <p className="user-email">{user.email}</p>
          <p className="member-since">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="profile-content">
        <h2>About</h2>
        <p className="bio">{user.bio}</p>
      </div>
    </div>
  );
}

export default UserProfile;
\`\`\`

### 实战代码示例二：自定义Hook与状态管理

\`\`\`jsx
import { useState, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serializer?: (value: T) => string;
  deserializer?: (value: string) => T;
}

function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
) {
  const { 
    defaultValue, 
    serializer = JSON.stringify, 
    deserializer = JSON.parse 
  } = options;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserializer(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, serializer(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }, [key, serializer, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage:', error);
    }
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue] as const;
}

// 使用示例
function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage('theme', { 
    defaultValue: 'light' 
  });

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  return (
    <button 
      onClick={toggleTheme}
      className={`theme-toggle theme-${theme}`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      Switch to {theme === 'light' ? 'dark' : 'light'} mode
    </button>
  );
}
\`\`\`

### 实战代码示例三：React Context与全局状态

\`\`\`jsx
import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

// 定义类型
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' };

// Reducer函数
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          )
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    }
    
    case 'UPDATE_QUANTITY': {
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }
    
    case 'CLEAR_CART': {
      return { ...state, items: [] };
    }
    
    case 'TOGGLE_CART': {
      return { ...state, isOpen: !state.isOpen };
    }
    
    default:
      return state;
  }
}

// Context
interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider组件
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false
  });

  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  }, [removeItem]);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const toggleCart = useCallback(() => {
    dispatch({ type: 'TOGGLE_CART' });
  }, []);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        totalItems,
        totalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
\`\`\`

### 实战代码示例四：React性能优化技巧

\`\`\`jsx
import { memo, useMemo, useCallback, useState } from 'react';

// 1. 使用memo避免不必要的重新渲染
interface ExpensiveComponentProps {
  data: { id: number; value: string }[];
  onItemClick: (id: number) => void;
}

const ExpensiveComponent = memo<ExpensiveComponentProps>(({ data, onItemClick }) => {
  // 复杂的计算逻辑
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      processedValue: item.value.toUpperCase(),
      hash: item.id * 7 + item.value.length
    }));
  }, [data]);

  return (
    <div className="expensive-list">
      {processedData.map(item => (
        <div 
          key={item.id} 
          onClick={() => onItemClick(item.id)}
          className="list-item"
        >
          <span>{item.processedValue}</span>
          <span className="hash">{item.hash}</span>
        </div>
      ))}
    </div>
  );
});

// 2. 使用useCallback稳定函数引用
function ParentComponent() {
  const [count, setCount] = useState(0);
  const [items] = useState([
    { id: 1, value: 'Item 1' },
    { id: 2, value: 'Item 2' },
    { id: 3, value: 'Item 3' }
  ]);

  // 使用useCallback避免函数引用变化
  const handleItemClick = useCallback((id: number) => {
    console.log(`Item clicked: ${id}`);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>
        Clicked {count} times
      </button>
      <ExpensiveComponent 
        data={items} 
        onItemClick={handleItemClick} 
      />
    </div>
  );
}

// 3. 使用useMemo缓存计算结果
function DataProcessor({ rawData }) {
  // 只有当rawData变化时才重新计算
  const processedData = useMemo(() => {
    console.log('Processing data...');
    return rawData
      .filter(item => item.active)
      .map(item => ({
        ...item,
        normalizedValue: item.value / 100,
        category: item.type === 'A' ? 'Primary' : 'Secondary'
      }))
      .sort((a, b) => a.normalizedValue - b.normalizedValue);
  }, [rawData]);

  return (
    <div>
      <h3>Processed Items: {processedData.length}</h3>
      {processedData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
\`\`\`

### 核心特性详解

1. **组件化开发**：React鼓励将UI拆分为独立的、可复用的组件。每个组件应该只负责一个功能，这样可以提高代码的可维护性和复用性。

2. **虚拟DOM**：React使用虚拟DOM来最小化实际DOM操作。当状态变化时，React会先在内存中计算虚拟DOM的差异，然后只更新需要改变的部分。

3. **单向数据流**：数据从父组件流向子组件，通过props传递。这种单向数据流使得数据流向清晰，易于追踪和调试。

4. **Hooks**：Hooks允许在函数组件中使用状态和生命周期方法。常用的Hooks包括useState、useEffect、useContext、useReducer、useCallback和useMemo。

5. **JSX语法**：JSX是一种JavaScript的语法扩展，允许在JavaScript中编写类似HTML的代码。JSX会被编译成普通的JavaScript函数调用。

6. **React Fiber**：React 16引入的新协调引擎，支持增量渲染和优先级调度，提高了大型应用的性能。

### 学习建议

学习React时，建议从基础概念开始，理解组件、props、state和生命周期。然后学习Hooks，掌握常用的Hook用法。实践中可以从简单的TodoList应用开始，逐步构建更复杂的项目。

理解React的设计理念和最佳实践非常重要，包括组件拆分原则、状态管理策略、性能优化技巧等。同时，了解React生态系统中的相关库如React Router、Redux、Axios等也是成为优秀React开发者的必备技能。`,
    'Node.js': `Node.js是基于Chrome V8引擎的JavaScript运行时。

### 实战代码示例

\`\`\`javascript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());

// 路由定义
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
\`\`\`

### 核心特性

1. **非阻塞IO**：高并发处理能力
2. **事件驱动**：基于事件循环的异步模型
3. **npm生态**：丰富的第三方包资源
4. **跨平台**：支持Windows、Linux、macOS`,
    'CSS': `CSS是用于描述网页样式的语言，包括布局、颜色、字体等。

### 实战代码示例

\`\`\`css
/* 现代CSS布局示例 */
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}
\`\`\`

### 核心特性

1. **层叠性**：样式可以叠加和覆盖
2. **继承性**：子元素继承父元素某些属性
3. **优先级**：选择器优先级决定样式应用
4. **媒体查询**：实现响应式布局`,
    'Git': `Git是分布式版本控制系统，支持分支管理、代码合并、版本回退等操作。

### 实战代码示例

\`\`\`bash
# 创建并切换到功能分支
git checkout -b feature/user-auth

# 添加并提交更改
git add .
git commit -m "feat: implement user authentication"

# 拉取主分支最新代码
git checkout main
git pull origin main

# 合并功能分支
git checkout feature/user-auth
git merge main --no-ff

# 解决冲突后推送到远程
git push origin feature/user-auth
\`\`\`

### 核心命令

1. **git init**：初始化仓库
2. **git add**：暂存更改
3. **git commit**：提交更改
4. **git branch**：管理分支
5. **git merge**：合并分支
6. **git push/pull**：同步远程仓库`,
    'Docker': `Docker是容器化平台，允许将应用程序及其依赖打包成容器。

### 实战代码示例

\`\`\`dockerfile
# Node.js应用Dockerfile
FROM node:18-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["node", "server.js"]
\`\`\`

\`\`\`yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
  db:
    image: mongo:5
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
\`\`\`

### 核心概念

1. **镜像**：只读的文件系统快照
2. **容器**：镜像的运行实例
3. **Dockerfile**：构建镜像的指令集
4. **Docker Compose**：多容器应用编排`,
    'SQL': `SQL是用于管理关系型数据库的标准语言。

### 实战代码示例

\`\`\`sql
-- 创建索引优化查询
CREATE INDEX idx_users_email ON users(email);

-- 复杂查询示例
SELECT 
    u.name,
    COUNT(o.id) as order_count,
    SUM(o.amount) as total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY total_spent DESC
LIMIT 10;

-- 事务处理
BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
\`\`\`

### 核心概念

1. **ACID特性**：原子性、一致性、隔离性、持久性
2. **索引**：加速查询的数据库对象
3. **事务**：一组不可分割的操作
4. **范式**：数据库设计的规范化规则`,
    'TypeScript': `TypeScript是JavaScript的超集，由Microsoft开发并维护。它在JavaScript的基础上添加了可选的静态类型系统、类、接口、泛型等特性，能够在编译时捕获错误，提高代码质量和开发效率。

### 核心概念

TypeScript的核心价值在于其类型系统，它提供了丰富的类型定义和类型检查功能。TypeScript代码最终会被编译成纯JavaScript，可以运行在任何支持JavaScript的环境中。

### 实战代码示例一：泛型与类型约束

\`\`\`typescript
// 泛型函数定义
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
  return array.map(transform);
}

// 使用泛型创建灵活的数据结构
interface Container<T> {
  value: T;
  getValue(): T;
  setValue(value: T): void;
}

class Box<T> implements Container<T> {
  constructor(public value: T) {}
  
  getValue(): T {
    return this.value;
  }
  
  setValue(value: T): void {
    this.value = value;
  }
}

// 泛型约束
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// 使用示例
const numberBox = new Box<number>(42);
const stringBox = new Box<string>("Hello");

logLength("Hello"); // 5
logLength([1, 2, 3]); // 3
logLength({ length: 10, value: "test" }); // 10
\`\`\`

### 实战代码示例二：高级类型与类型体操

\`\`\`typescript
// 条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<string>; // true
type B = IsString<number>; // false

// 映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type User = {
  id: number;
  name: string;
  email: string;
};

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;

// 条件类型推断
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

function getUser() {
  return { id: 1, name: "John" };
}

type UserReturnType = ReturnType<typeof getUser>; // { id: number; name: string }

// 模板字面量类型
type Color = "red" | "green" | "blue";
type Size = "small" | "medium" | "large";
type ColorSize = `${Color}-${Size}`; // "red-small" | "red-medium" | ...

// 类型守卫
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function feedPet(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TypeScript知道pet是Fish
  } else {
    pet.fly(); // TypeScript知道pet是Bird
  }
}
\`\`\`

### 实战代码示例三：装饰器与元编程

\`\`\`typescript
// 类装饰器
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

function logger(target: Function) {
  const original = target;
  
  function construct(constructor: any, args: any[]) {
    console.log(\`Creating instance of \${original.name}\`);
    return new constructor(...args);
  }
  
  construct.prototype = original.prototype;
  return construct;
}

@logger
@sealed
class Greeter {
  greeting: string;
  
  constructor(message: string) {
    this.greeting = message;
  }
  
  greet() {
    return \`Hello, \${this.greeting}\`;
  }
}

// 属性装饰器
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

// 方法装饰器
function time(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.time(propertyKey);
    const result = originalMethod.apply(this, args);
    console.timeEnd(propertyKey);
    return result;
  };
  
  return descriptor;
}

class Calculator {
  @readonly
  readonly PI = 3.14159;
  
  @time
  add(a: number, b: number): number {
    return a + b;
  }
  
  @time
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
\`\`\`

### 实战代码示例四：模块与命名空间

\`\`\`typescript
// types.ts - 类型定义模块
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export type UserRole = 'admin' | 'user' | 'guest';

export interface UserCreateInput {
  name: string;
  email: string;
  password: string;
}

// user-service.ts - 服务模块
import { User, UserCreateInput } from './types';

export class UserService {
  private users: Map<string, User> = new Map();
  
  createUser(input: UserCreateInput): User {
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: input.name,
      email: input.email,
      createdAt: new Date()
    };
    
    this.users.set(user.id, user);
    return user;
  }
  
  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }
  
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}

// 使用命名空间组织相关功能
namespace Validation {
  export function isEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
  
  export function isPhone(phone: string): boolean {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone);
  }
  
  export function isUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// 使用示例
const userService = new UserService();
const newUser = userService.createUser({
  name: "Alice",
  email: "alice@example.com",
  password: "secure123"
});

console.log(Validation.isEmail(newUser.email)); // true
\`\`\`

### 核心特性详解

1. **静态类型系统**：TypeScript提供可选的静态类型检查，可以在编译时发现类型错误，提高代码可靠性。

2. **类型推断**：TypeScript可以自动推断变量的类型，减少显式类型注解的需要。

3. **泛型**：支持泛型类型和泛型函数，可以创建类型安全的可复用组件。

4. **类型体操**：提供丰富的高级类型操作，包括条件类型、映射类型、模板字面量类型等。

5. **接口和类型别名**：支持接口定义和类型别名，用于定义复杂的数据结构。

6. **装饰器**：支持类、属性和方法装饰器，用于元编程和代码增强。

7. **模块系统**：支持ES模块和CommonJS模块，提供良好的代码组织方式。

### 学习建议

学习TypeScript时，建议先掌握基础类型、接口、泛型等核心概念。然后深入学习类型体操和高级类型特性。实践中可以从将现有的JavaScript项目逐步迁移到TypeScript开始。

理解TypeScript的类型系统是关键，包括类型推断、类型兼容、类型守卫等概念。同时，掌握常用的类型工具函数如Partial、Readonly、Pick、Omit等可以大幅提高开发效率。`,
    'Vue': `Vue是渐进式JavaScript框架，以易学易用著称。

### 实战代码示例

\`\`\`vue
<script setup>
import { ref, computed, watch } from 'vue';

// 响应式状态
const count = ref(0);
const name = ref('');

// 计算属性
const doubled = computed(() => count.value * 2);

// 侦听器
watch(count, (newVal, oldVal) => {
  console.log(\`count changed from \${oldVal} to \${newVal}\`);
});

// 方法
function increment() {
  count.value++;
}

function greet() {
  alert(\`Hello, \${name.value || 'Guest'}!\`);
}
</script>

<template>
  <div class="counter">
    <input v-model="name" placeholder="Enter your name" />
    <p>Count: {{ count }} (doubled: {{ doubled }})</p>
    <button @click="increment">Increment</button>
    <button @click="greet">Greet</button>
  </div>
</template>
\`\`\`

### 核心特性

1. **响应式**：数据驱动视图更新
2. **组合式API**：更灵活的逻辑组织
3. **模板语法**：简洁的HTML扩展
4. **组件化**：可复用的UI单元`,
    'Linux': `Linux是开源操作系统内核，广泛用于服务器环境。

### 实战代码示例

\`\`\`bash
# 查看系统资源使用
top
htop  # 更友好的界面

# 文件和目录操作
ls -la              # 列出所有文件（包括隐藏）
mkdir -p dir1/dir2  # 创建嵌套目录
cp -r source dest   # 递归复制
rm -rf dir          # 强制删除目录

# 进程管理
ps aux | grep node  # 查找进程
kill -9 <pid>       # 强制终止进程
nohup node app.js & # 后台运行

# 文件内容处理
grep -r "pattern" . # 递归搜索
sed -i 's/old/new/g' file.txt  # 替换内容
awk '{print $1}' file.txt       # 提取第一列
\`\`\`

### 核心概念

1. **一切皆文件**：设备、进程、目录都是文件
2. **权限系统**：rwx权限控制
3. **管道**：命令间数据传递
4. **脚本**：自动化任务执行`,
    'HTTP': `HTTP是超文本传输协议，是Web通信的基础。

### 实战代码示例

\`\`\`javascript
// HTTP请求示例
fetch('/api/data', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token'
  },
  cache: 'no-cache'
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => console.log(data))
.catch(error => console.error('Error:', error));

// HTTP状态码含义
// 1xx: 信息响应
// 2xx: 成功响应
// 3xx: 重定向
// 4xx: 客户端错误
// 5xx: 服务器错误
\`\`\`

### 核心概念

1. **无状态**：每次请求独立
2. **请求方法**：GET、POST、PUT、DELETE等
3. **状态码**：表示请求结果
4. **头部**：传递额外信息`,
    'Web安全': `Web安全涉及保护Web应用免受各种攻击。

### 实战代码示例

\`\`\`javascript
// XSS防护：转义用户输入
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, char => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return entities[char];
  });
}

// CSRF防护：验证CSRF token
function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }
  next();
}

// 密码安全：使用bcrypt加密
import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
\`\`\`

### 常见攻击类型

1. **XSS**：跨站脚本攻击
2. **CSRF**：跨站请求伪造
3. **SQL注入**：数据库攻击
4. **XSS**：跨站脚本攻击`,
    'Kubernetes': `Kubernetes是容器编排平台，用于自动化部署、扩展和管理容器化应用。

### 实战代码示例

\`\`\`yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app
        image: my-app:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: my-app-service
spec:
  selector:
    app: my-app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
\`\`\`

### 核心概念

1. **Pod**：最小部署单元
2. **Service**：服务发现和负载均衡
3. **Deployment**：声明式部署管理
4. **ReplicaSet**：副本数量控制`
  };
  
  const matchedKey = Object.keys(contents).find(key => keyword.includes(key));
  return matchedKey ? contents[matchedKey] : `这是一项重要的编程技术。

### 实战代码示例

\`\`\`javascript
// 示例代码
const example = 'Hello World';
console.log(example);
\`\`\`

掌握这项技术对于提升开发能力非常重要。`;
};

const getComparisonData = (keyword) => {
  const comparisons = {
    'Python': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Python | 语法简洁，生态丰富 | 执行速度较慢 | Web开发、数据分析、AI |
| Java | 性能优异，生态成熟 | 语法繁琐，学习曲线陡 | 企业级后端 |
| Go | 性能好，并发支持好 | 生态相对较小 | 高并发服务 |
| Node.js | JavaScript全栈，开发快 | 单线程限制 | Web全栈开发 |`,
    'JavaScript': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Vue | 易学易用，文档友好 | 生态相对较小 | 中小型项目 |
| React | 生态强大，灵活性高 | 配置复杂 | 大型项目 |
| Angular | 功能完整，结构严谨 | 学习曲线陡 | 企业级应用 |
| Svelte | 编译时优化，性能好 | 生态较小 | 高性能应用 |`,
    'React': `| 状态管理方案 | 优点 | 缺点 | 适用场景 |
|-------------|------|------|---------|
| useState | 简单易用 | 不适合复杂状态 | 组件内部状态 |
| Context API | 跨组件共享 | 性能一般 | 全局简单状态 |
| Redux | 可预测，可调试 | 样板代码多 | 大型复杂应用 |
| Zustand | 轻量，API简洁 | 生态较小 | 中小型应用 |`,
    'Node.js': `| 框架 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Express | 灵活，社区成熟 | 默认功能少 | 快速开发 |
| Koa | 现代设计，中间件优雅 | 生态较小 | 新项目 |
| NestJS | 架构严谨，TypeScript | 学习曲线陡 | 企业级应用 |
| Fastify | 性能优异，schema验证 | 生态较小 | 高性能服务 |`,
    'Docker': `| 部署方式 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| 虚拟机 | 隔离性强 | 资源占用大 | 需要完全隔离 |
| Docker容器 | 轻量，启动快 | 隔离性有限 | 微服务架构 |
| Serverless | 按需付费，免运维 | 冷启动延迟 | 事件驱动应用 |
| 裸金属 | 性能最佳 | 运维复杂 | 高性能计算 |`,
    'SQL': `| 数据库类型 | 优点 | 缺点 | 适用场景 |
|------------|------|------|---------|
| MySQL | 成熟稳定，生态好 | 扩展性有限 | 中小型应用 |
| PostgreSQL | 功能强大，标准兼容 | 学习成本高 | 复杂查询场景 |
| MongoDB | 灵活schema，扩展好 | 查询能力有限 | 非结构化数据 |
| Redis | 内存存储，速度快 | 数据量有限 | 缓存、会话 |`,
    'TypeScript': `| 类型系统 | 优点 | 缺点 | 适用场景 |
|------------|------|------|---------|
| TypeScript | 类型安全，工具支持好 | 编译步骤，学习成本 | 大型项目 |
| Flow | 渐进式，侵入性小 | 生态较小 | 渐进式迁移 |
| JavaScript | 灵活，开发快 | 运行时错误 | 小型项目、脚本 |`,
    'CSS': `| 布局方案 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| Flexbox | 一维布局，简单 | 复杂布局受限 | 行/列布局 |
| Grid | 二维布局，强大 | 旧浏览器不支持 | 复杂网格布局 |
| Float | 兼容性好 | 布局复杂 | 旧项目维护 |
| Table | 兼容性极好 | 语义不当 | 表格数据展示 |`,
    'Git': `| 工作流 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| Git Flow | 规范清晰 | 流程复杂 | 大型团队 |
| GitHub Flow | 简单灵活 | 缺乏规范 | 小型团队 |
| Trunk Based | 持续集成，快速 | 需要严格审查 | 高频发布 |
| GitLab Flow | 分支策略灵活 | 学习成本 | 中大型项目 |`,
    '算法': `| 排序算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|----------|------------|------------|---------|
| 快速排序 | O(n log n) | O(log n) | 通用排序 |
| 归并排序 | O(n log n) | O(n) | 稳定排序 |
| 冒泡排序 | O(n²) | O(1) | 小规模数据 |
| 插入排序 | O(n²) | O(1) | 近乎有序数据 |`,
    'Webpack': `| 构建工具 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| Webpack | 功能全面，生态好 | 配置复杂 | 大型项目 |
| Vite | 启动快，ES Module | 生态较小 | 中小型项目 |
| Rollup | 打包体积小 | 配置复杂 | 库打包 |
| Parcel | 零配置，开箱即用 | 定制性差 | 快速原型 |`,
    'Redis': `| 缓存策略 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| 读写穿透 | 一致性好 | 性能较低 | 数据一致性要求高 |
| 写回策略 | 性能好 | 可能丢失数据 | 性能优先 |
| 过期策略 | 内存可控 | 可能缓存击穿 | 常规场景 |
| LRU淘汰 | 智能缓存 | 实现复杂 | 内存有限 |`,
    'Kubernetes': `| 部署策略 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| RollingUpdate | 零停机更新 | 可能版本不一致 | 常规更新 |
| Recreate | 简单，一致性好 | 服务中断 | 小流量服务 |
| Blue/Green | 零风险回滚 | 资源双倍 | 关键业务 |
| Canary | 灰度发布，可控 | 配置复杂 | 重要更新 |`,
    'Nginx': `| 负载均衡算法 | 优点 | 缺点 | 适用场景 |
|--------------|------|------|---------|
| Round Robin | 简单，公平 | 不考虑负载 | 服务器配置相近 |
| Least Connections | 负载均衡 | 需要状态追踪 | 服务器配置不同 |
| IP Hash | 会话保持 | 负载不均 | 需要会话保持 |
| Weighted | 权重控制 | 配置复杂 | 服务器性能不同 |`
  };
  
  const matchedKey = Object.keys(comparisons).find(key => keyword.includes(key));
  return matchedKey ? comparisons[matchedKey] : `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案A | 优点A | 缺点A | 场景A |
| 方案B | 优点B | 缺点B | 场景B |`;
};

const getResources = (keyword) => {
  const resources = {
    'Python': `- [Python官方文档](https://docs.python.org/3/) — 最权威的官方指南
- [Python Tutorial](https://www.w3schools.com/python/) — 适合入门学习
- [Real Python](https://realpython.com/) — 实战教程和技巧
- [Python Cookbook](https://python3-cookbook.readthedocs.io/) — 进阶实战`,
    'JavaScript': `- [MDN Web Docs](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) — 官方级文档
- [JavaScript.info](https://zh.javascript.info/) — 现代教程
- [ES6 Features](https://github.com/lukehoban/es6features) — ES6特性速查
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS) — 深入理解JS`,
    'React': `- [React官方文档](https://react.dev/) — 最新官方指南
- [React Patterns](https://reactpatterns.com/) — 设计模式
- [React Training](https://reacttraining.com/) — 专业培训资源
- [React Hooks Guide](https://react.dev/reference/react) — Hooks详解`,
    'Node.js': `- [Node.js官方文档](https://nodejs.org/zh-cn/docs/) — 官方文档
- [Express.js](https://expressjs.com/zh-cn/) — Express框架
- [Node.js Guide](https://nodejs.dev/en/learn/) — 学习指南
- [NPM Docs](https://docs.npmjs.com/) — 包管理文档`,
    'CSS': `- [MDN CSS指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS) — 权威文档
- [CSS-Tricks](https://css-tricks.com/) — 技巧和教程
- [Flexbox Froggy](https://flexboxfroggy.com/) — 交互式学习
- [CSS Grid Garden](https://cssgridgarden.com/) — Grid学习游戏`,
    'Git': `- [Git官方文档](https://git-scm.com/docs) — 官方参考
- [Pro Git](https://git-scm.com/book/zh/v2) — 经典书籍
- [GitHub Guides](https://guides.github.com/) — GitHub使用指南
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf) — 速查表`,
    'Docker': `- [Docker官方文档](https://docs.docker.com/) — 官方指南
- [Docker Labs](https://labs.play-with-docker.com/) — 交互式教程
- [Docker Compose Docs](https://docs.docker.com/compose/) — Compose文档
- [Kubernetes Docs](https://kubernetes.io/docs/) — K8s官方文档`,
    'SQL': `- [SQL教程](https://www.w3schools.com/sql/) — 入门教程
- [PostgreSQL Docs](https://www.postgresql.org/docs/) — PostgreSQL文档
- [MySQL Docs](https://dev.mysql.com/doc/) — MySQL文档
- [SQL Zoo](https://sqlzoo.net/) — 交互式练习`,
    'TypeScript': `- [TypeScript官方文档](https://www.typescriptlang.org/docs/) — 官方指南
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 手册
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — 深入学习
- [Type Challenges](https://github.com/type-challenges/type-challenges) — 类型练习`,
    'Vue': `- [Vue官方文档](https://cn.vuejs.org/) — 官方指南
- [Vue Router](https://router.vuejs.org/) — 路由文档
- [Pinia](https://pinia.vuejs.org/) — 状态管理
- [Vue School](https://vueschool.io/) — 视频课程`,
    'Linux': `- [Linux教程](https://www.runoob.com/linux/linux-tutorial.html) — 入门教程
- [Linux Command](https://linuxcommand.org/) — 命令参考
- [Bash Guide](https://guide.bash.academy/) — Shell脚本指南
- [TLDP](https://tldp.org/) — Linux文档项目`,
    'HTTP': `- [MDN HTTP指南](https://developer.mozilla.org/zh-CN/docs/Web/HTTP) — HTTP文档
- [HTTP权威指南](https://www.oreilly.com/library/view/http-the-definitive/1565925092/) — 经典书籍
- [REST API Tutorial](https://restfulapi.net/) — REST设计指南
- [OWASP API Security](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html) — API安全`,
    '算法': `- [LeetCode](https://leetcode.com/) — 刷题平台
- [算法导论](https://mitpress.mit.edu/books/introduction-algorithms) — 经典教材
- [Algorithms](https://algs4.cs.princeton.edu/home/) — 普林斯顿课程
- [VisuAlgo](https://visualgo.net/) — 算法可视化`,
    'MongoDB': `- [MongoDB官方文档](https://www.mongodb.com/docs/) — 官方指南
- [MongoDB University](https://university.mongodb.com/) — 免费课程
- [MongoDB Manual](https://www.mongodb.com/docs/manual/) — 完整手册
- [MongoDB Compass](https://www.mongodb.com/products/compass) — GUI工具`,
    'Webpack': `- [Webpack官方文档](https://webpack.js.org/docs/) — 官方指南
- [Vite](https://vitejs.dev/guide/) — 现代构建工具
- [Rollup](https://rollupjs.org/guide/en/) — 库打包工具
- [Parcel](https://parceljs.org/docs/) — 零配置构建`,
    'ES6': `- [ES6标准](https://tc39.es/ecma262/) — 官方标准
- [ES6 Features](https://github.com/lukehoban/es6features) — 特性汇总
- [Babel Docs](https://babeljs.io/docs/) — 转译工具
- [Polyfill.io](https://polyfill.io/) — 兼容性处理`,
    'Web安全': `- [OWASP](https://owasp.org/) — Web安全权威组织
- [MDN安全指南](https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/First_steps/Website_security) — 安全入门
- [Security Headers](https://securityheaders.com/) — 安全头检测
- [CSP Guide](https://content-security-policy.com/) — CSP指南`,
    'Kubernetes': `- [Kubernetes官方文档](https://kubernetes.io/docs/) — 官方指南
- [Kubernetes Handbook](https://kubernetes.io/docs/concepts/overview/) — 概念手册
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) — 命令速查
- [Minikube](https://minikube.sigs.k8s.io/docs/) — 本地测试`,
    'Redis': `- [Redis官方文档](https://redis.io/docs/) — 官方指南
- [Redis Labs](https://redislabs.com/) — Redis企业版
- [Redis Commands](https://redis.io/commands/) — 命令参考
- [Redis University](https://university.redislabs.com/) — 免费课程`,
    'Nginx': `- [Nginx官方文档](https://nginx.org/en/docs/) — 官方指南
- [Nginx Config](https://nginxconfig.io/) — 配置生成器
- [Nginx Cookbook](https://nginx.org/en/docs/beginners_guide.html) — 入门指南
- [Nginx Blog](https://www.nginx.com/blog/) — 官方博客`
  };
  
  const matchedKey = Object.keys(resources).find(key => keyword.includes(key));
  return matchedKey ? resources[matchedKey] : `- [官方文档](https://example.com/docs) — 最权威
- [在线教程](https://example.com/tutorial) — 适合入门
- [进阶课程](https://example.com/course) — 系统学习
- [实战项目](https://example.com/projects) — 实践练习`;
};

const getCTA = (keyword) => {
  const ctas = {
    'Python': `现在就开始你的Python学习之旅！建议从简单的项目开始，比如写一个待办事项应用或爬虫程序。实践是最好的学习方式，记得多写代码、多调试、多总结。

如果你正在寻找云服务器来部署Python应用，可以考虑使用[DigitalOcean](https://m.do.co/c/c9c6aa51c904)，新用户可获得100美元额度！`,
    'JavaScript': `JavaScript是Web开发的核心，掌握它是成为全栈开发者的第一步。建议通过构建实际项目来巩固知识，比如一个响应式网站或交互式应用。

需要AI编程助手提升效率？试试[GitHub Copilot](https://github.com/features/copilot)，让AI帮你写出更好的代码！`,
    'React': `React的学习曲线虽然有点陡，但掌握后开发效率会大幅提升。建议从TodoList、博客系统等小项目开始练手。

部署React应用推荐使用[Vercel](https://vercel.com/signup)，一键部署，体验极佳！`,
    'Node.js': `Node.js让JavaScript可以运行在服务端，开启全栈开发之路。建议从构建RESTful API开始，逐步深入。

需要云服务器部署Node.js应用？[DigitalOcean](https://m.do.co/c/c9c6aa51c904)提供高性能虚拟机，适合开发者！`,
    'CSS': `CSS是前端开发的必修课，掌握现代布局技术可以让你的页面更加美观。建议通过模仿优秀网站的布局来学习。

学习CSS遇到困难？[Udemy](https://www.udemy.com/?aff_code=YOUR_CODE)上有很多优质的CSS课程！`,
    'Git': `Git是团队协作的必备工具，掌握良好的工作流可以提高团队效率。建议在实际项目中多加练习。

代码托管首选[GitHub](https://github.com/)，全球最大的开发者社区！`,
    'Docker': `容器化是现代DevOps的必备技能，学会Docker可以让你的应用部署更加简单。建议从打包一个简单的Node.js应用开始。

需要云服务器运行容器？[DigitalOcean](https://m.do.co/c/c9c6aa51c904)提供一键部署Docker的服务！`,
    'SQL': `数据库是应用的核心，掌握SQL可以让你更好地处理数据。建议通过实际的数据库设计练习来巩固知识。

学习SQL推荐[Udemy](https://www.udemy.com/?aff_code=YOUR_CODE)上的数据库课程！`,
    'TypeScript': `TypeScript可以让你的JavaScript代码更加健壮，减少运行时错误。建议从现有项目的类型标注开始逐步引入。

需要AI编程助手？[GitHub Copilot](https://github.com/features/copilot)对TypeScript有很好的支持！`,
    'Vue': `Vue以其易学易用著称，是入门前端框架的好选择。建议从简单的组件开始，逐步构建完整应用。

部署Vue应用推荐[Vercel](https://vercel.com/signup)，零配置体验！`,
    'Linux': `Linux是服务器端的主流操作系统，掌握命令行可以大幅提高工作效率。建议每天练习一些命令，熟能生巧。

需要Linux服务器？[DigitalOcean](https://m.do.co/c/c9c6aa51c904)提供稳定的Linux虚拟机！`,
    'HTTP': `理解HTTP协议是后端开发的基础，建议通过抓包工具观察实际的HTTP请求来学习。

学习API设计推荐参考[RESTful API设计指南](https://restfulapi.net/)！`,
    '算法': `算法能力是程序员的核心竞争力，需要持续学习和练习。建议每天刷几道算法题，日积月累。

刷题首选[LeetCode](https://leetcode.com/)，海量题目等你来挑战！`,
    'MongoDB': `NoSQL数据库在现代Web开发中应用广泛，掌握MongoDB可以处理各种非结构化数据。

需要MongoDB托管服务？[MongoDB Atlas](https://www.mongodb.com/atlas/database)提供免费套餐！`,
    'Webpack': `构建工具是现代前端开发的必备，掌握Webpack可以优化你的项目构建流程。

现代构建工具推荐[Vite](https://vitejs.dev/)，速度更快！`,
    'Web安全': `Web安全是每个开发者都应该关注的话题，了解常见攻击方式可以保护你的应用。

学习Web安全推荐[OWASP](https://owasp.org/)的资源！`,
    'Kubernetes': `Kubernetes是容器编排的标准，掌握它可以管理大规模容器化应用。

学习K8s推荐官方文档和[Kubernetes Academy](https://kubernetes.io/training/)！`,
    'Redis': `Redis是高性能缓存系统，掌握它可以显著提升应用性能。

需要Redis托管服务？[Redis Labs](https://redislabs.com/)提供企业级服务！`,
    'Nginx': `Nginx是高性能Web服务器和反向代理，掌握它可以优化你的网站性能。

学习Nginx推荐官方文档和配置示例！`
  };
  
  const matchedKey = Object.keys(ctas).find(key => keyword.includes(key));
  return matchedKey ? ctas[matchedKey] : `现在就开始学习这项技术吧！建议制定学习计划，每天坚持练习。实践是最好的老师，祝你学习愉快！

需要学习资源？[Udemy](https://www.udemy.com/?aff_code=YOUR_CODE)上有很多优质课程！`;
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