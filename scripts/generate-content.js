import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';
import { validateAndFilter } from './content-validator.js';

const OUTPUT_DIR = 'content';
const REJECTED_DIR = 'content-rejected';

const keywords = [
  "如何学习Python编程入门",
  "JavaScript面试题及答案2024",
  "React框架学习路线推荐",
  "Node.js后端开发教程",
  "CSS布局技巧大全",
  "Git版本控制最佳实践",
  "Docker容器化部署指南",
  "SQL数据库查询优化",
  "TypeScript类型系统详解",
  "Vue3组合式API教程",
  "Linux命令行常用命令",
  "HTTP协议基础知识",
  "RESTful API设计原则",
  "前端性能优化技巧",
  "算法复杂度分析入门",
  "MongoDB数据库使用教程",
  "Webpack打包配置指南",
  "ES6新特性详解",
  "移动端网页适配方案",
  "单元测试最佳实践"
];

const generateArticle = (keyword) => {
  const safeKeyword = sanitizeKeyword(keyword);
  const title = safeKeyword;
  const slug = safeKeyword.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
  
  const content = `# ${title}

## 引言

在当今数字化时代，编程技术的重要性日益凸显。${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '')}作为软件开发领域的核心技能，受到越来越多开发者的关注。本文将从基础概念入手，为你系统地介绍相关知识和实践经验。

## 核心概念

### 基础定义

${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '').replace('入门', '')}是现代软件开发中不可或缺的技术栈组成部分。它涵盖了理论基础、实践应用和最佳实践等多个层面。

### 学习意义

掌握${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '')}能够帮助开发者：
- 提升开发效率和代码质量
- 增强系统的稳定性和可维护性
- 更好地与团队协作完成项目
- 适应不断变化的技术需求

## 学习路径

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

## 常用工具推荐

| 工具名称 | 主要用途 | 适用场景 |
|---------|---------|---------|
| 官方文档 | 学习和查阅 | 日常开发参考 |
| 在线教程 | 系统学习 | 入门和进阶 |
| 开发工具 | 编码调试 | 日常开发 |
| 代码托管 | 版本控制 | 团队协作 |

## 实战案例

### 基础实现示例

\`\`\`javascript
const example = function() {
  const result = 'Hello World';
  console.log(result);
  return result;
};
\`\`\`

### 进阶应用示例

\`\`\`javascript
class AdvancedExample {
  constructor(options = {}) {
    this.options = {
      defaultValue: 'default',
      ...options
    };
  }
  
  execute() {
    return this.options;
  }
}
\`\`\`

## 注意事项

学习过程中需要注意：
- 保持持续学习的心态
- 注重实践而非单纯理论
- 善用社区资源和文档
- 保持代码规范和可维护性

## 总结

${safeKeyword.replace('如何', '').replace('学习', '').replace('教程', '').replace('指南', '')}是一项需要长期学习和实践的技能。通过系统的学习路径和持续的实践，你将能够逐步掌握这门技术，提升自己的开发能力。

## 推荐资源

- 官方文档：获取最新和最权威的信息
- 在线课程：系统化的学习路径
- 技术社区：与其他开发者交流
- 开源项目：在实践中学习

---

希望本文对你的学习有所帮助！如果有任何问题或建议，欢迎交流讨论。
`;

  return {
    title,
    slug,
    content,
    date: new Date().toISOString().split('T')[0],
    tags: ['技术', '编程', '开发', '学习']
  };
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

  for (const keyword of keywords) {
    const article = generateArticle(keyword);
    const validation = await validateAndFilter(article.content);
    
    logValidationResult(keyword, validation);
    
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
      date: article.date,
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