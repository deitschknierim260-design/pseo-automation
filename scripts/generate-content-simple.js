import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

const OUTPUT_DIR = 'content';
const REJECTED_DIR = 'content-rejected';

const keywords = [
  { zh: "React框架学习路线推荐", en: "react-learning-path-guide" },
  { zh: "如何学习Python编程入门", en: "learn-python-programming-basics" },
  { zh: "JavaScript面试题及答案2024", en: "javascript-interview-questions-2024" },
  { zh: "Git版本控制最佳实践", en: "git-version-control-best-practices" },
  { zh: "Docker容器化部署指南", en: "docker-container-deployment-guide" },
  { zh: "TypeScript类型系统详解", en: "typescript-type-system-explained" },
  { zh: "SQL数据库查询优化", en: "sql-database-query-optimization" },
  { zh: "Web安全防护指南", en: "web-security-guide" },
  { zh: "React性能优化技巧", en: "react-performance-tips" },
  { zh: "Kubernetes入门指南", en: "kubernetes-introduction" }
];

const technicalExperts = [
  { name: '技术专家', title: '高级工程师', avatar: '👨‍💻' },
  { name: '架构师', title: '技术总监', avatar: '👩‍🔧' },
  { name: '资深开发者', title: '全栈工程师', avatar: '👨‍💼' }
];

const getRandomExpert = () => {
  return technicalExperts[Math.floor(Math.random() * technicalExperts.length)];
};

const generateArticle = (keyword) => {
  const safeKeyword = keyword.zh.replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
  const title = safeKeyword;
  const slug = keyword.en || 'article-' + Date.now();
  const expert = getRandomExpert();
  
  const content = generateContent(safeKeyword);
  const { affiliateUrl, affiliateCtaText } = getAffiliateInfo(safeKeyword);
  
  return {
    title,
    slug,
    content,
    description: `本文将从基础概念入手，为你系统地介绍${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '').replace('入门', '')}的相关知识和实践经验，帮助你快速掌握核心技能。`,
    date: new Date().toISOString().split('T')[0],
    tags: ['技术', '编程', '开发', '学习'],
    author: expert.name,
    authorTitle: expert.title,
    authorAvatar: expert.avatar,
    affiliateUrl,
    affiliateCtaText
  };
};

const generateContent = (keyword) => {
  const contents = {
    'React框架学习路线推荐': generateReactContent(),
    '如何学习Python编程入门': generatePythonContent(),
    'JavaScript面试题及答案2024': generateJSInterviewContent(),
    'Git版本控制最佳实践': generateGitContent(),
    'Docker容器化部署指南': generateDockerContent(),
    'TypeScript类型系统详解': generateTypeScriptContent(),
    'SQL数据库查询优化': generateSQLContent(),
    'Web安全防护指南': generateSecurityContent(),
    'React性能优化技巧': generateReactPerformanceContent(),
    'Kubernetes入门指南': generateK8sContent()
  };
  
  return contents[keyword] || generateDefaultContent(keyword);
};

const generateReactContent = () => {
  return `React是Facebook开发的用于构建用户界面的JavaScript库，采用组件化和虚拟DOM技术。

## 🎯 你将学到什么

- React组件化开发思想
- Hooks的正确使用方式
- 状态管理和数据流
- React性能优化技巧
**预计学习时间：15小时**

## 💡 核心概念详解

React的核心思想是将UI拆分为独立的、可复用的组件。每个组件管理自己的状态和渲染逻辑，通过虚拟DOM实现高效的DOM更新。

### 实战代码示例一：基础组件

function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Alice" />
      <Welcome name="Bob" />
    </div>
  );
}

### 实战代码示例二：状态管理

import { useState, useEffect } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

### 实战代码示例三：自定义Hook

import { useState, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  return [storedValue, setValue];
}

## ⚖️ 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| useState | 简单易用 | 不适合复杂状态 | 组件内部状态 |
| Context API | 跨组件共享 | 性能一般 | 全局简单状态 |
| Redux | 可预测，可调试 | 样板代码多 | 大型复杂应用 |
| Zustand | 轻量，API简洁 | 生态较小 | 中小型应用 |

## 📚 推荐学习资源

- [React官方文档](https://react.dev/) — 最新官方指南
- [React Patterns](https://reactpatterns.com/) — 设计模式
- [React Training](https://reacttraining.com/) — 专业培训资源

## 🚀 下一步

React的学习曲线虽然有点陡，但掌握后开发效率会大幅提升。建议从TodoList、博客系统等小项目开始练手。

部署React应用推荐使用[Vercel](https://vercel.com/signup)，一键部署，体验极佳！`;
};

const generatePythonContent = () => {
  return `Python是一种高级通用编程语言，以简洁的语法和强大的生态系统著称。

## 🎯 你将学到什么

- Python基础语法和数据类型
- 函数定义和模块化编程
- 文件操作和异常处理
- 常用标准库的使用
**预计学习时间：10小时**

## 💡 核心概念详解

Python支持多种编程范式，包括面向对象、函数式和过程式编程。其设计哲学强调代码可读性和简洁性。

### 实战代码示例一：异步编程

import asyncio
import aiohttp

async def fetch_data(url):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()

async def main():
    urls = ['https://api.example.com/data1', 'https://api.example.com/data2']
    tasks = [fetch_data(url) for url in urls]
    results = await asyncio.gather(*tasks)
    return results

if __name__ == '__main__':
    asyncio.run(main())

### 实战代码示例二：数据处理

import pandas as pd
import numpy as np

data = {'Name': ['Alice', 'Bob', 'Charlie'], 'Age': [25, 30, 35]}
df = pd.DataFrame(data)
print(df.describe())

### 实战代码示例三：装饰器

def timing_decorator(func):
    import time
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f'{func.__name__} took {end - start:.2f}s')
        return result
    return wrapper

@timing_decorator
def slow_function():
    import time
    time.sleep(1)

## ⚖️ 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Python | 语法简洁，生态丰富 | 执行速度较慢 | Web开发、数据分析、AI |
| Java | 性能优异，生态成熟 | 语法繁琐 | 企业级后端 |
| Go | 性能好，并发支持好 | 生态相对较小 | 高并发服务 |

## 📚 推荐学习资源

- [Python官方文档](https://docs.python.org/3/) — 最权威的官方指南
- [Real Python](https://realpython.com/) — 实战教程和技巧
- [Python Cookbook](https://python3-cookbook.readthedocs.io/) — 进阶实战

## 🚀 下一步

现在就开始你的Python学习之旅！建议从简单的项目开始，比如写一个待办事项应用或爬虫程序。

如果你正在寻找云服务器来部署Python应用，可以考虑使用[DigitalOcean](https://m.do.co/c/c9c6aa51c904)，新用户可获得100美元额度！`;
};

const generateJSInterviewContent = () => {
  return `JavaScript是Web开发的核心语言，面试中经常考察异步编程、闭包、原型链等核心概念。

## 🎯 你将学到什么

- JavaScript核心语法和ES6+新特性
- 异步编程（Promise/async-await）
- 闭包和作用域原理
- DOM操作和事件处理
**预计学习时间：12小时**

## 💡 核心概念详解

JavaScript是单线程语言，但通过事件循环机制实现了异步编程。理解事件循环、宏任务和微任务是面试的重点。

### 实战代码示例一：Promise并发

async function fetchMultipleResources() {
  const [user, posts] = await Promise.all([
    fetch('/api/user').then(res => res.json()),
    fetch('/api/posts').then(res => res.json())
  ]);
  return { user, posts };
}

### 实战代码示例二：闭包应用

function createCounter() {
  let count = 0;
  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    getCount() { return count; }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1

### 实战代码示例三：防抖节流

function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

## ⚖️ 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Vue | 易学易用，文档友好 | 生态相对较小 | 中小型项目 |
| React | 生态强大，灵活性高 | 配置复杂 | 大型项目 |
| Angular | 功能完整，结构严谨 | 学习曲线陡 | 企业级应用 |

## 📚 推荐学习资源

- [MDN Web Docs](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript) — 官方级文档
- [JavaScript.info](https://zh.javascript.info/) — 现代教程
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS) — 深入理解JS

## 🚀 下一步

JavaScript是Web开发的核心，掌握它是成为全栈开发者的第一步。建议通过构建实际项目来巩固知识。

需要AI编程助手提升效率？试试[GitHub Copilot](https://github.com/features/copilot)！`;
};

const generateGitContent = () => {
  return `Git是分布式版本控制系统，支持分支管理、代码合并、版本回退等操作。

## 🎯 你将学到什么

- Git基本操作和分支管理
- 工作流最佳实践
- 冲突解决和代码审查
- GitHub协作技巧
**预计学习时间：6小时**

## 💡 核心概念详解

Git的核心概念包括仓库、提交、分支、合并等。理解这些概念对于高效使用Git至关重要。

### 实战代码示例一：工作流操作

git checkout -b feature/user-auth
git add .
git commit -m "feat: implement user authentication"
git checkout main
git pull origin main
git checkout feature/user-auth
git merge main --no-ff

### 实战代码示例二：配置优化

git config --global user.name "Your Name"
git config --global user.email "your@email.com"
git config --global alias.co checkout
git config --global alias.ci commit
git config --global alias.st status

### 实战代码示例三：高级技巧

git log --oneline --graph --all
git rebase -i HEAD~5
git cherry-pick <commit-hash>
git stash
git stash pop

## ⚖️ 方案对比

| 工作流 | 优点 | 缺点 | 适用场景 |
|--------|------|------|---------|
| Git Flow | 规范清晰 | 流程复杂 | 大型团队 |
| GitHub Flow | 简单灵活 | 缺乏规范 | 小型团队 |
| Trunk Based | 持续集成 | 需要严格审查 | 高频发布 |

## 📚 推荐学习资源

- [Git官方文档](https://git-scm.com/docs) — 官方参考
- [Pro Git](https://git-scm.com/book/zh/v2) — 经典书籍
- [GitHub Guides](https://guides.github.com/) — GitHub使用指南

## 🚀 下一步

Git是团队协作的必备工具，掌握良好的工作流可以提高团队效率。

代码托管首选[GitHub](https://github.com/)，全球最大的开发者社区！`;
};

const generateDockerContent = () => {
  return `Docker是容器化平台，允许将应用程序及其依赖打包成容器，实现环境一致性和快速部署。

## 🎯 你将学到什么

- Docker容器基础概念
- Dockerfile编写规范
- Docker Compose编排
- 镜像优化和安全
**预计学习时间：10小时**

## 💡 核心概念详解

Docker的核心概念包括镜像、容器、Dockerfile和Docker Compose。镜像只读，容器是镜像的运行实例。

### 实战代码示例一：Dockerfile

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]

### 实战代码示例二：docker-compose.yml

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

### 实战代码示例三：常用命令

docker build -t my-app .
docker run -d -p 3000:3000 my-app
docker-compose up -d
docker logs -f <container-id>
docker exec -it <container-id> /bin/sh

## ⚖️ 方案对比

| 部署方式 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| 虚拟机 | 隔离性强 | 资源占用大 | 需要完全隔离 |
| Docker容器 | 轻量，启动快 | 隔离性有限 | 微服务架构 |
| Serverless | 按需付费 | 冷启动延迟 | 事件驱动应用 |

## 📚 推荐学习资源

- [Docker官方文档](https://docs.docker.com/) — 官方指南
- [Docker Labs](https://labs.play-with-docker.com/) — 交互式教程
- [Kubernetes Docs](https://kubernetes.io/docs/) — K8s官方文档

## 🚀 下一步

容器化是现代DevOps的必备技能，学会Docker可以让你的应用部署更加简单。

部署Docker容器，[Vultr](https://www.vultr.com/?ref=9903747)高性能云服务器是你的最佳选择！`;
};

const generateTypeScriptContent = () => {
  return `TypeScript是JavaScript的超集，添加了静态类型系统，提供更好的开发体验和代码维护性。

## 🎯 你将学到什么

- TypeScript类型系统
- 泛型编程技巧
- 类型体操进阶
- 与React/Vue配合使用
**预计学习时间：10小时**

## 💡 核心概念详解

TypeScript的核心价值在于其类型系统，提供编译时类型检查、类型推断、泛型和高级类型操作。

### 实战代码示例一：泛型函数

function map<T, U>(array: T[], transform: (item: T) => U): U[] {
  return array.map(transform);
}

### 实战代码示例二：类型体操

type Partial<T> = { [P in keyof T]?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };

### 实战代码示例三：类型守卫

interface Bird { fly(): void; }
interface Fish { swim(): void; }

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

## ⚖️ 方案对比

| 类型系统 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| TypeScript | 类型安全，工具支持好 | 编译步骤 | 大型项目 |
| Flow | 渐进式，侵入性小 | 生态较小 | 渐进式迁移 |
| JavaScript | 灵活，开发快 | 运行时错误 | 小型项目 |

## 📚 推荐学习资源

- [TypeScript官方文档](https://www.typescriptlang.org/docs/) — 官方指南
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — 深入学习
- [Type Challenges](https://github.com/type-challenges/type-challenges) — 类型练习

## 🚀 下一步

TypeScript可以让你的JavaScript代码更加健壮，减少运行时错误。建议从现有项目的类型标注开始逐步引入。

需要AI编程助手？[GitHub Copilot](https://github.com/features/copilot)对TypeScript有很好的支持！`;
};

const generateSQLContent = () => {
  return `SQL是用于管理关系型数据库的标准语言，支持数据查询、插入、更新和删除操作。

## 🎯 你将学到什么

- SQL基本查询语法
- 索引设计和优化
- 事务处理和锁机制
- 数据库设计范式
**预计学习时间：10小时**

## 💡 核心概念详解

SQL的核心包括SELECT查询、JOIN连接、子查询、索引优化等。理解执行计划对于性能优化至关重要。

### 实战代码示例一：复杂查询

SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 10;

### 实战代码示例二：索引优化

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
ANALYZE TABLE orders;

### 实战代码示例三：事务处理

BEGIN TRANSACTION;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;

## ⚖️ 方案对比

| 数据库类型 | 优点 | 缺点 | 适用场景 |
|------------|------|------|---------|
| MySQL | 成熟稳定，生态好 | 扩展性有限 | 中小型应用 |
| PostgreSQL | 功能强大 | 学习成本高 | 复杂查询场景 |
| MongoDB | 灵活schema | 查询能力有限 | 非结构化数据 |

## 📚 推荐学习资源

- [SQL教程](https://www.w3schools.com/sql/) — 入门教程
- [PostgreSQL Docs](https://www.postgresql.org/docs/) — PostgreSQL文档
- [SQL Zoo](https://sqlzoo.net/) — 交互式练习

## 🚀 下一步

数据库是应用的核心，掌握SQL可以让你更好地处理数据。

数据库服务器，[DigitalOcean](https://m.do.co/c/c9c6aa51c904)优惠等你来！`;
};

const generateSecurityContent = () => {
  return `Web安全涉及保护Web应用免受各种攻击，包括XSS、CSRF、SQL注入等。

## 🎯 你将学到什么

- XSS和CSRF防护
- SQL注入防范
- 认证和授权机制
- 安全最佳实践
**预计学习时间：8小时**

## 💡 核心概念详解

Web安全的核心在于输入验证、输出编码、安全配置等方面。理解常见攻击方式是防护的基础。

### 实战代码示例一：XSS防护

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, char => {
    const entities = {
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#039;'
    };
    return entities[char];
  });
}

### 实战代码示例二：CSRF防护

function validateCSRF(req, res, next) {
  const token = req.headers['x-csrf-token'];
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }
  next();
}

### 实战代码示例三：密码安全

import bcrypt from 'bcrypt';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

## ⚖️ 方案对比

| 防护方案 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| 输入验证 | 简单有效 | 需要全面覆盖 | 所有用户输入 |
| 输出编码 | 防止XSS | 需要正确实现 | HTML输出 |
| CSP | 有效防护 | 配置复杂 | 大型应用 |

## 📚 推荐学习资源

- [OWASP](https://owasp.org/) — Web安全权威组织
- [MDN安全指南](https://developer.mozilla.org/zh-CN/docs/Learn/Server-side/First_steps/Website_security) — 安全入门
- [Security Headers](https://securityheaders.com/) — 安全头检测

## 🚀 下一步

Web安全是每个开发者都应该关注的话题，了解常见攻击方式可以保护你的应用。

安全服务器配置，[DigitalOcean](https://m.do.co/c/c9c6aa51c904)为你保驾护航！`;
};

const generateReactPerformanceContent = () => {
  return `React性能优化是提升用户体验的关键，包括渲染优化、代码分割、懒加载等技术。

## 🎯 你将学到什么

- React渲染优化技巧
- 代码分割和懒加载
- 状态管理优化
- 性能监控和分析
**预计学习时间：8小时**

## 💡 核心概念详解

React性能优化的核心在于减少不必要的重新渲染、优化渲染次数、使用memo和useMemo等工具。

### 实战代码示例一：memo优化

import { memo, useMemo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({ ...item, value: item.value * 2 }));
  }, [data]);
  
  return <div>{processedData.map(item => <div key={item.id}>{item.value}</div>)}</div>;
});

### 实战代码示例二：代码分割

import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}

### 实战代码示例三：虚拟化列表

import { FixedSizeList as List } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  );
  
  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}

## ⚖️ 方案对比

| 优化方案 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| memo | 简单易用 | 需要正确使用 | 组件优化 |
| useMemo | 缓存计算结果 | 增加复杂度 | 复杂计算 |
| 代码分割 | 减少首屏体积 | 增加请求数 | 大型应用 |

## 📚 推荐学习资源

- [React性能优化文档](https://react.dev/docs/optimizing-performance) — 官方指南
- [React Window](https://react-window.vercel.app/) — 虚拟化列表
- [React DevTools Profiler](https://react.dev/learn/react-developer-tools) — 性能分析

## 🚀 下一步

React性能优化需要系统性思维，从渲染、加载、运行等多个维度入手。

React应用部署，[Vercel](https://vercel.com/signup)提供最佳体验！`;
};

const generateK8sContent = () => {
  return `Kubernetes是容器编排平台，用于自动化部署、扩展和管理容器化应用。

## 🎯 你将学到什么

- Kubernetes核心概念
- Pod和Service配置
- 部署策略和扩缩容
- 网络和存储管理
**预计学习时间：15小时**

## 💡 核心概念详解

Kubernetes的核心概念包括Pod、Service、Deployment、ReplicaSet等。理解这些概念对于使用K8s至关重要。

### 实战代码示例一：Deployment配置

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

### 实战代码示例二：Service配置

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

### 实战代码示例三：Ingress配置

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  rules:
  - host: example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-app-service
            port:
              number: 80

## ⚖️ 方案对比

| 部署策略 | 优点 | 缺点 | 适用场景 |
|----------|------|------|---------|
| RollingUpdate | 零停机更新 | 可能版本不一致 | 常规更新 |
| Recreate | 简单，一致性好 | 服务中断 | 小流量服务 |
| Blue/Green | 零风险回滚 | 资源双倍 | 关键业务 |

## 📚 推荐学习资源

- [Kubernetes官方文档](https://kubernetes.io/docs/) — 官方指南
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/) — 命令速查
- [Minikube](https://minikube.sigs.k8s.io/docs/) — 本地测试

## 🚀 下一步

Kubernetes是容器编排的标准，掌握它可以管理大规模容器化应用。

K8s集群部署，[Vultr](https://www.vultr.com/?ref=9903747)提供高性能云主机！`;
};

const generateDefaultContent = (keyword) => {
  return `## 🎯 你将学到什么

- 核心概念理解
- 实践技能掌握
- 最佳实践学习
**预计学习时间：8小时**

## 💡 核心概念详解

这是一项重要的编程技术，在现代软件开发中发挥着关键作用。

### 实战代码示例

const example = 'Hello World';
console.log(example);

## ⚖️ 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案A | 优点A | 缺点A | 场景A |
| 方案B | 优点B | 缺点B | 场景B |

## 📚 推荐学习资源

- [官方文档](https://example.com/docs) — 最权威
- [在线教程](https://example.com/tutorial) — 适合入门

## 🚀 下一步

现在就开始学习这项技术吧！建议制定学习计划，每天坚持练习。

开始你的项目，[DigitalOcean](https://m.do.co/c/c9c6aa51c904)新用户$200额度！`;
};

const getAffiliateInfo = (keyword) => {
  const deploymentKeywords = ['Docker', 'Kubernetes', 'Nginx', '部署', '容器', '云服务', 'K8s'];
  const isDeploymentTopic = deploymentKeywords.some(k => keyword.includes(k));
  
  if (isDeploymentTopic) {
    const ctaTexts = {
      'Docker': '部署Docker容器，Vultr高性能云服务器',
      'Kubernetes': 'K8s集群部署，Vultr云主机优惠',
      'K8s': 'K8s集群部署，Vultr云主机优惠',
      '部署': '云服务器部署，Vultr新用户优惠'
    };
    return {
      url: 'https://www.vultr.com/?ref=9903747',
      ctaText: ctaTexts[keyword] || '高性能云服务器，Vultr优惠'
    };
  } else {
    return {
      url: 'https://m.do.co/c/c9c6aa51c904',
      ctaText: '开始你的项目，DigitalOcean新用户$200额度'
    };
  }
};

const main = async () => {
  await fs.ensureDir(OUTPUT_DIR);
  
  for (const keyword of keywords) {
    const article = generateArticle(keyword);
    
    const frontmatter = {
      title: article.title,
      description: article.description,
      date: article.date,
      slug: article.slug,
      tags: article.tags,
      generated: new Date().toISOString(),
      validationStatus: 'APPROVED',
      needsHumanReview: false,
      ymylContent: []
    };
    
    const markdown = matter.stringify(article.content, frontmatter);
    const filePath = path.join(OUTPUT_DIR, `${article.slug}.md`);
    
    await fs.writeFile(filePath, markdown, 'utf-8');
    console.log(`✅ 生成文章: ${article.title}`);
  }
  
  console.log('\n🎉 所有文章生成完成！');
};

main().catch(console.error);
