import fs from 'fs-extra';
import path from 'path';
import matter from 'gray-matter';

const CONTENT_DIR = 'content';

const main = async () => {
  if (!await fs.pathExists(CONTENT_DIR)) {
    console.log('❌ content目录不存在');
    return;
  }
  
  const files = await fs.readdir(CONTENT_DIR);
  const pendingFiles = [];
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(CONTENT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const { data } = matter(content);
      
      if (data.needsHumanReview) {
        pendingFiles.push({
          file,
          title: data.title,
          ymyl: data.ymylContent || []
        });
      }
    }
  }
  
  if (pendingFiles.length === 0) {
    console.log('✅ 没有待审核的文章');
    return;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`⚠️ 发现 ${pendingFiles.length} 篇待审核文章:`);
  console.log(`${'='.repeat(60)}`);
  
  pendingFiles.forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.file}`);
    console.log(`   标题: ${item.title}`);
    if (item.ymyl.length > 0) {
      console.log(`   YMYL内容: ${item.ymyl.join(', ')}`);
    }
    console.log(`   路径: ${path.join(CONTENT_DIR, item.file)}`);
  });
  
  console.log(`\n${'='.repeat(60)}`);
  console.log('操作提示:');
  console.log('- 查看内容: cat content/[文件名]');
  console.log('- 批准发布: 修改 frontmatter 中 needsHumanReview 为 false');
  console.log('- 拒绝发布: 移动文件至 content-rejected/ 目录');
  console.log(`${'='.repeat(60)}`);
};

main().catch(console.error);