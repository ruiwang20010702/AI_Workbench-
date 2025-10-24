import { Request, Response } from 'express';
import axios from 'axios';
import { AIService } from '../services/aiService';
import { AIGenerateRequest } from '../types';
import { AIUsageLogModel } from '../models/AIUsageLog';
import pool from '../config/database';

export class AIController {
  // AI文本生成
  static async generateText(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const request: AIGenerateRequest & { model?: string; apiKey?: string } = req.body;
      const response = await AIService.generateText(request);

      // 记录AI使用日志
      const actionType = request.source === 'assistant' ? 'assistant_qa' : 'generate';
      await AIUsageLogModel.create({
        user_id: req.user.id,
        action_type: actionType, // 根据来源区分助手问答与普通生成
        model_name: response.data.model || request.model || 'gpt-3.5-turbo',
        input_tokens: response.data.usage?.prompt_tokens || 0,
        output_tokens: response.data.usage?.completion_tokens || 0,
        cost_cents: Math.round((response.data.usage?.total_tokens || 0) * 0.01) // 简单的成本计算，每token 0.01分
      });

      res.json(response);
    } catch (error: any) {
      console.error('AI生成错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 智能摘要
  static async summarize(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, maxLength, model, apiKey } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const summary = await AIService.summarizeText(text, maxLength, { model, apiKey });

      // 记录AI使用日志
      await AIUsageLogModel.create({
        user_id: req.user.id,
        action_type: 'summarize',
        model_name: model || 'gpt-3.5-turbo',
        input_tokens: Math.ceil(text.length / 4), // 估算输入token数
        output_tokens: Math.ceil(summary.length / 4), // 估算输出token数
        cost_cents: Math.round((Math.ceil(text.length / 4) + Math.ceil(summary.length / 4)) * 0.01)
      });

      res.json({
        success: true,
        message: '摘要生成成功',
        data: {
          summary,
          original_length: text.length,
          summary_length: summary.length
        }
      });
    } catch (error: any) {
      console.error('摘要生成错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 智能改写
  static async rewrite(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, style, tone, language, model, apiKey } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const rewritten = await AIService.rewriteText(text, style, { model, apiKey });

      // 记录AI使用日志
      await AIUsageLogModel.create({
        user_id: req.user.id,
        action_type: 'rewrite',
        model_name: model || 'gpt-3.5-turbo',
        input_tokens: Math.ceil(text.length / 4), // 估算输入token数
        output_tokens: Math.ceil(rewritten.length / 4), // 估算输出token数
        cost_cents: Math.round((Math.ceil(text.length / 4) + Math.ceil(rewritten.length / 4)) * 0.01)
      });

      res.json({
        success: true,
        message: '改写成功',
        data: {
          rewritten_text: rewritten,
          usage: {
            prompt_tokens: Math.ceil(text.length / 4),
            completion_tokens: Math.ceil(rewritten.length / 4),
            total_tokens: Math.ceil(text.length / 4) + Math.ceil(rewritten.length / 4)
          },
          model: model || 'gpt-3.5-turbo'
        }
      });
    } catch (error: any) {
      console.error('改写错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 智能翻译
  static async translate(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, from, to, model, apiKey } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const translated = await AIService.translateText(text, to, { model, apiKey });

      // 记录AI使用日志
      await AIUsageLogModel.create({
        user_id: req.user.id,
        action_type: 'translate',
        model_name: model || 'gpt-3.5-turbo',
        input_tokens: Math.ceil(text.length / 4), // 估算输入token数
        output_tokens: Math.ceil(translated.length / 4), // 估算输出token数
        cost_cents: Math.round((Math.ceil(text.length / 4) + Math.ceil(translated.length / 4)) * 0.01)
      });

      res.json({
        success: true,
        message: '翻译成功',
        data: {
          translated_text: translated,
          usage: {
            prompt_tokens: Math.ceil(text.length / 4),
            completion_tokens: Math.ceil(translated.length / 4),
            total_tokens: Math.ceil(text.length / 4) + Math.ceil(translated.length / 4)
          },
          model: model || 'gpt-3.5-turbo'
        }
      });
    } catch (error: any) {
      console.error('翻译错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 文本分析（支持外部第三方API；未配置时回退本地实现）
  static async analyze(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, analysisType } = req.body as { text?: string; analysisType?: 'sentiment' | 'keywords' | 'topics' | 'readability' };
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      // 优先使用外部分析服务（通过环境变量控制）
      const externalUrl = process.env.AI_ANALYZE_API_URL;
      const externalKey = process.env.AI_ANALYZE_API_KEY;
      const useExternal = process.env.AI_ANALYZE_USE_EXTERNAL === 'true' || (!!externalUrl && !!externalKey);

      if (useExternal && externalUrl && externalKey) {
        try {
          const resp = await axios.post(
            externalUrl,
            { text, analysisType },
            {
              headers: {
                Authorization: `Bearer ${externalKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            }
          );

          const payload: any = resp.data || {};
          const analysis = payload.analysis ?? payload.data?.analysis ?? payload.result ?? payload;
          const outputJson = JSON.stringify(analysis);

          await AIUsageLogModel.create({
            user_id: req.user.id,
            action_type: 'analyze',
            model_name: payload.model || 'external-analysis',
            input_tokens: Math.ceil(text.length / 4),
            output_tokens: Math.ceil(outputJson.length / 4),
            cost_cents: Math.round(((payload.usage?.total_tokens ?? 0) * 0.01) || 0)
          });

          return res.json({
            success: true,
            message: '分析成功',
            data: { analysis, source: 'external' }
          });
        } catch (e: any) {
          console.error('外部分析服务错误:', e?.response?.data || e?.message || e);
          // 继续回退到本地实现
        }
      }

      // ===== 本地分析实现（原有逻辑） =====
      // 句子分割（中英文简单处理）
      const sentences = text
        .replace(/[\r\n]+/g, ' ')
        .split(/[。！？.!?]/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // 词语分割（英文按空格，中文按字符近似）
      const tokens = text
        .toLowerCase()
        .replace(/[\p{P}\p{S}]/gu, ' ')
        .split(/\s+/)
        .filter(t => t.length > 0);

      // 停用词（中英文混合基础集）
      const stopwords = new Set<string>([
        'the','and','or','a','an','to','of','in','on','for','with','is','are','was','were','be','been','it','this','that','by','as','at','from','我们','你们','他们','以及','并且','但是','如果','因为','所以','就是','还有','一个','一些','这些','那些','什么','没有','可以','能够','以及'
      ]);

      const filteredTokens = tokens.filter(t => !stopwords.has(t) && t.length > 1);

      // 关键词（按频率排序）
      const freq: Record<string, number> = {};
      for (const t of filteredTokens) {
        freq[t] = (freq[t] || 0) + 1;
      }
      const keywords = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([w]) => w);

      // 情感分析（极简词典法，支持中英文）
      const positiveWords = new Set(['good','great','excellent','amazing','happy','success','positive','helpful','efficient','love','赞','优秀','开心','满意','成功','积极','高效','喜欢']);
      const negativeWords = new Set(['bad','poor','terrible','sad','fail','negative','problem','issue','hate','worst','差','糟糕','难过','失败','消极','问题','困扰','讨厌']);
      let score = 0;
      for (const t of filteredTokens) {
        if (positiveWords.has(t)) score += 1;
        if (negativeWords.has(t)) score -= 1;
      }
      // 归一化到[-1,1]
      const normScore = filteredTokens.length > 0 ? Math.max(-1, Math.min(1, score / Math.sqrt(filteredTokens.length))) : 0;
      const sentiment = {
        score: Number(normScore.toFixed(2)),
        label: normScore > 0.2 ? 'positive' : normScore < -0.2 ? 'negative' : 'neutral'
      };

      // 主题猜测（简单规则匹配）
      const topicRules: Array<{ topic: string; keywords: string[] }> = [
        { topic: '技术', keywords: ['代码','开发','函数','api','bug','frontend','backend','server','database'] },
        { topic: '工作', keywords: ['项目','会议','计划','任务','deadline','团队','协作','报告'] },
        { topic: '学习', keywords: ['学习','课程','考试','知识','练习','阅读','笔记'] },
        { topic: '生活', keywords: ['生活','家庭','旅行','饮食','健康','休息'] },
        { topic: 'AI', keywords: ['ai','人工智能','模型','训练','推理','prompt'] },
        { topic: '金融', keywords: ['投资','理财','成本','预算','收入','支出'] }
      ];
      const topicsSet = new Set<string>();
      for (const rule of topicRules) {
        for (const k of rule.keywords) {
          if (text.toLowerCase().includes(k.toLowerCase())) {
            topicsSet.add(rule.topic);
            break;
          }
        }
      }
      // 如果未命中规则，回退为高频关键词近似主题
      const topics = Array.from(topicsSet);
      if (topics.length === 0) {
        topics.push(...keywords.slice(0, 3));
      }

      // 可读性（平均句长、估算阅读难度）
      const totalChars = text.length;
      const avgSentenceLength = sentences.length > 0 ? totalChars / sentences.length : totalChars;
      const readability = {
        score: Number((100 - Math.min(90, avgSentenceLength / 2)).toFixed(2)),
        grade: avgSentenceLength < 40 ? 'easy' : avgSentenceLength < 80 ? 'medium' : 'hard'
      };

      const fullAnalysis = {
        sentiment,
        keywords,
        topics,
        readability
      } as Record<string, any>;

      const analysis = analysisType ? { [analysisType]: fullAnalysis[analysisType] } : fullAnalysis;

      // 记录使用（归档为本地分析）
      const outputJson = JSON.stringify(analysis);
      await AIUsageLogModel.create({
        user_id: req.user.id,
        action_type: 'analyze',
        model_name: 'builtin-analysis',
        input_tokens: Math.ceil(text.length / 4),
        output_tokens: Math.ceil(outputJson.length / 4),
        cost_cents: 0
      });

      return res.json({
        success: true,
        message: '分析成功',
        data: { analysis, source: 'builtin' }
      });
    } catch (error: any) {
      console.error('文本分析错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 写作建议
  static async getWritingSuggestions(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, context, model, apiKey } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const suggestions = await AIService.generateWritingSuggestions(text);

      res.json({
        success: true,
        message: '写作建议生成成功',
        data: suggestions
      });
    } catch (error: any) {
      console.error('写作建议错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 标题建议
  static async getTitleSuggestions(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, model, apiKey } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const suggestions = await AIService.generateTitleSuggestions(text);

      res.json({
        success: true,
        message: '标题建议生成成功',
        data: suggestions
      });
    } catch (error: any) {
      console.error('标题建议错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 标签建议
  static async getTagSuggestions(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, model, apiKey } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const suggestions = await AIService.generateTagSuggestions(text);

      res.json({
        success: true,
        message: '标签建议生成成功',
        data: suggestions
      });
    } catch (error: any) {
      console.error('标签建议错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 生成嵌入向量
  static async generateEmbedding(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      const { text, model, apiKey } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          success: false,
          message: '文本内容不能为空'
        });
      }

      const embedding = await AIService.generateEmbedding(text);

      res.json({
        success: true,
        message: '嵌入向量生成成功',
        data: {
          embedding
        }
      });
    } catch (error: any) {
      console.error('生成嵌入向量错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 获取AI使用历史记录
  static async getUsageHistory(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      // 解析查询参数，兼容字符串类型
      const limitParam = req.query.limit as string | undefined;
      const offsetParam = req.query.offset as string | undefined;
      const actionTypeParam = req.query.action_type as string | undefined;

      const limitNum = limitParam ? parseInt(limitParam, 10) : 20;
      const offsetNum = offsetParam ? parseInt(offsetParam, 10) : 0;
      const options: { action_type?: string; limit?: number; offset?: number } = {
        limit: limitNum,
        offset: offsetNum
      };
      if (actionTypeParam !== undefined) {
        options.action_type = actionTypeParam;
      }

      const logs = await AIUsageLogModel.findByUserId(req.user.id, options);

      res.json({
        success: true,
        message: '获取AI使用记录成功',
        data: {
          logs
        }
      });
    } catch (error: any) {
      console.error('获取AI使用记录错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 获取最近的AI使用记录
  static async getRecentUsage(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '未认证的用户'
        });
      }

      // 解析限制参数
      const limitParam = req.query.limit as string | undefined;
      const limitNum = limitParam ? parseInt(limitParam, 10) : 10;

      const logs = await AIUsageLogModel.getRecentByUserId(req.user.id, limitNum);

      res.json({
        success: true,
        message: '获取最近AI使用记录成功',
        data: {
          logs
        }
      });
    } catch (error: any) {
      console.error('获取最近AI使用记录错误:', error);
      return res.status(500).json({
        success: false,
        message: error.message || '服务器内部错误'
      });
    }
  }

  // 新增：AI使用统计（总次数、token总数、类型分布、月度汇总）
  static async getStats(req: Request, res: Response): Promise<Response | void> {
    try {
      if (!req.user) {
        return res.status(401).json({ message: '未认证的用户' });
      }

      const userId = req.user.id;

      // 总体统计
      const totals = await AIUsageLogModel.getUsageStats(userId);
      const totalRequests = totals.total_requests;
      const totalTokens = (totals.total_input_tokens || 0) + (totals.total_output_tokens || 0);

      // 类型分布
      const byTypeResult = await pool.query(
        `SELECT action_type, COUNT(*)::int AS count FROM ai_usage_logs WHERE user_id = $1 GROUP BY action_type`,
        [userId]
      );
      const requestsByType: Record<string, number> = {};
      for (const row of byTypeResult.rows) {
        requestsByType[row.action_type] = row.count;
      }

      // 月度汇总（近6个月）
      const monthlyResult = await pool.query(
        `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
                COUNT(*)::int AS requests,
                COALESCE(SUM(input_tokens + output_tokens), 0)::int AS tokens
         FROM ai_usage_logs
         WHERE user_id = $1
         GROUP BY 1
         ORDER BY 1 DESC
         LIMIT 6`,
        [userId]
      );
      const monthlyUsage = monthlyResult.rows.map((r: any) => ({
        month: r.month,
        requests: r.requests,
        tokens: r.tokens
      }));

      // 返回纯数据对象，符合前端aiService.getUsageStats的期待
      return res.json({
        totalRequests,
        totalTokens,
        requestsByType,
        monthlyUsage
      });
    } catch (error: any) {
      console.error('获取AI使用统计错误:', error);
      return res.status(500).json({ message: error.message || '服务器内部错误' });
    }
  }
}