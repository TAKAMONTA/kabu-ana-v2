import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* アプリ情報 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">株穴</h3>
            <p className="text-gray-300 text-sm">
              AIによる株式分析で、より良い投資判断をサポートします。
            </p>
          </div>
          
          {/* リンク */}
          <div>
            <h3 className="text-lg font-semibold mb-4">リンク</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  サービスについて
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-300 hover:text-white transition-colors">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-300 hover:text-white transition-colors">
                  利用規約
                </a>
              </li>
            </ul>
          </div>
          
          {/* お問い合わせ */}
          <div>
            <h3 className="text-lg font-semibold mb-4">お問い合わせ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  お問い合わせフォーム
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white transition-colors">
                  よくある質問
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* 免責事項 */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="text-xs text-gray-400 space-y-2">
            <p>
              <strong>【免責事項】</strong>
              本サービスで提供される情報は投資の参考情報として提供されるものであり、投資勧誘を目的としたものではありません。
            </p>
            <p>
              投資に関する最終決定は、必ずお客様ご自身の判断で行ってください。投資結果に関して当社は一切の責任を負いません。
            </p>
            <p>
              株式投資にはリスクが伴います。投資元本は保証されておらず、損失が生じる可能性があります。
            </p>
          </div>
        </div>
        
        {/* コピーライト */}
        <div className="border-t border-gray-700 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} 株穴. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// default export を明示的に設定
export default Footer;