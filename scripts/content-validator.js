import fs from 'fs-extra';
import path from 'path';

const HARD_BLOCK_KEYWORDS = [
  '赌博', '色情', '毒品', '诈骗', '违法', '反动', '暴力',
  '裸', '嫖', '妓', '淫', '毒', '枪', '弹',
  '发票', '走私', '洗钱', '传销', '非法集资',
  'usdt', 'btc', '必赚', '特效药', '治愈率',
  '注册机', 'keygen', 'torrent', '种子下载', '成人用品'
];

const SOFT_BLOCK_KEYWORDS = [
  '作弊', '破解', '翻墙', 'VPN', '代写', '黑客', '盗版'
];

const HARD_BLOCK_PATTERNS = [
  /赌博|博彩|彩票/i,
  /色情|成人服务|性服务/i,
  /毒品|贩毒|吸毒|冰毒|海洛因/i,
  /诈骗|欺诈|骗钱|骗术/i,
  /违法|非法|违法所得/i,
  /反动|颠覆|分裂|台独|藏独/i,
  /暴力|恐怖|袭击|杀人|抢劫/i,
  /发票代开|偷税|漏税|虚开发票/i,
  /走私|洗钱|传销|非法集资/i,
  /usdt|btc|比特币|以太坊/i,
  /必赚|稳赚|百分百赚钱/i,
  /特效药|根治|治愈率/i,
  /注册机|keygen|破解软件/i,
  /torrent|种子下载|磁力链接/i
];

const SOFT_BLOCK_PATTERNS = [
  /作弊|cheat/i,
  /破解|crack/i,
  /翻墙|VPN/i,
  /代写|代笔/i,
  /黑客|hacker/i,
  /盗版|pirate/i
];

const YMYL_KEYWORDS = [
  '理财', '投资', '股票', '基金', '保险', '贷款', '信用卡',
  '疾病', '症状', '诊断', '治疗', '药物', '药品', '医生', '医院',
  '减肥', '增高', '丰胸', '美白', '壮阳', '补肾',
  '考试答案', '真题', '押题', '保过', '代考'
];

const checkSafetyLevel = (content) => {
  const result = {
    hardBlock: [],
    softBlock: [],
    ymyl: [],
    isSafe: true,
    needsReview: false
  };

  HARD_BLOCK_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      result.hardBlock.push(`硬拦截关键词: "${keyword}"`);
      result.isSafe = false;
    }
  });

  HARD_BLOCK_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(content)) {
      result.hardBlock.push(`硬拦截模式 #${index + 1}: ${pattern}`);
      result.isSafe = false;
    }
  });

  SOFT_BLOCK_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      result.softBlock.push(`待审核关键词: "${keyword}"`);
      result.needsReview = true;
    }
  });

  SOFT_BLOCK_PATTERNS.forEach((pattern, index) => {
    if (pattern.test(content)) {
      result.softBlock.push(`待审核模式 #${index + 1}: ${pattern}`);
      result.needsReview = true;
    }
  });

  YMYL_KEYWORDS.forEach(keyword => {
    if (content.includes(keyword)) {
      result.ymyl.push(`YMYL内容: "${keyword}"`);
    }
  });

  return result;
};

const checkContentQuality = (content) => {
  const issues = [];
  
  if (content.length < 500) {
    issues.push('内容长度不足500字符');
  }
  
  if (content.length > 10000) {
    issues.push('内容长度超过10000字符');
  }
  
  const uniqueWords = new Set(content.split(/\s+/)).size;
  const totalWords = content.split(/\s+/).length;
  if (totalWords > 0 && uniqueWords / totalWords < 0.5) {
    issues.push('内容重复度较高');
  }
  
  return issues;
};

const validateAndFilter = async (content) => {
  const safetyResult = checkSafetyLevel(content);
  const qualityIssues = checkContentQuality(content);

  return {
    ...safetyResult,
    qualityIssues,
    canProceed: safetyResult.isSafe,
    action: safetyResult.isSafe ? 'PROCEED' : 'BLOCK'
  };
};

const batchValidate = async (contentDir) => {
  if (!await fs.pathExists(contentDir)) {
    return { files: [], issues: [], safeCount: 0, blockCount: 0 };
  }
  
  const files = await fs.readdir(contentDir);
  const results = [];
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(contentDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const validation = validateAndFilter(content);
      
      results.push({
        file,
        ...validation
      });
    }
  }
  
  return {
    files: results,
    safeCount: results.filter(r => r.isSafe).length,
    blockCount: results.filter(r => !r.isSafe).length,
    needsReviewCount: results.filter(r => r.needsReview).length
  };
};

export { 
  checkSafetyLevel, 
  checkContentQuality, 
  validateAndFilter, 
  batchValidate 
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const main = async () => {
    const result = await batchValidate('content');
    console.log(`安全文件: ${result.safeCount}`);
    console.log(`拦截文件: ${result.blockCount}`);
    console.log(`待审核文件: ${result.needsReviewCount}`);
  };
  main().catch(console.error);
}