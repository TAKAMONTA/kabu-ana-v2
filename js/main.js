// js/main.js - メインJavaScriptファイル

class AIStockApp {
    constructor() {
        this.currentUser = null;
        this.currentPlan = null;
        this.isModalOpen = false;
        
        this.init();
    }

    init() {
        console.log('AI Stock App initializing...');
        
        // DOM要素の取得
        this.elements = {
            pricingBtns: document.querySelectorAll('#pricingBtn, #heroCtaBtn'),
            loginBtn: document.getElementById('loginBtn'),
            planButtons: document.querySelectorAll('.plan-button')
        };

        this.bindEvents();
        this.checkServerHealth();
        this.loadUserData();
    }

    bindEvents() {
        // 料金プランボタン
        this.elements.pricingBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openPricingModal());
        });

        // ログインボタン
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => this.handleLogin());
        }

        // スムーススクロール
        this.initSmoothScroll();

        // ESCキーでモーダルを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closePricingModal();
            }
        });
    }

    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    async checkServerHealth() {
        try {
            const response = await fetch('/health');
            const data = await response.json();
            console.log('Server health:', data);
            
            if (data.status === 'ok') {
                this.showNotification('サーバーに接続しました', 'success');
            }
        } catch (error) {
            console.error('Health check failed:', error);
            this.showNotification('サーバーとの接続に問題があります', 'warning');
        }
    }

    loadUserData() {
        // ローカルストレージまたはサーバーからユーザーデータを読み込み
        const userData = localStorage.getItem('aistock_user');
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.updateUIForUser();
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('aistock_user');
            }
        }
    }

    updateUIForUser() {
        if (this.currentUser) {
            const loginBtn = this.elements.loginBtn;
            if (loginBtn) {
                loginBtn.textContent = this.currentUser.name || 'ユーザー';
                loginBtn.onclick = () => this.showUserMenu();
            }
        }
    }

    handleLogin() {
        this.showNotification('ログイン機能は開発中です', 'info');
        
        // デモ用のユーザー設定
        const demoUser = {
            id: 'demo_user_' + Date.now(),
            name: 'デモユーザー',
            email: 'demo@example.com',
            plan: 'free'
        };
        
        this.currentUser = demoUser;
        localStorage.setItem('aistock_user', JSON.stringify(demoUser));
        this.updateUIForUser();
    }

    openPricingModal() {
        this.createPricingModal();
        this.isModalOpen = true;
    }

    closePricingModal() {
        const modal = document.getElementById('pricingModal');
        if (modal) {
            modal.remove();
            this.isModalOpen = false;
        }
    }

    createPricingModal() {
        // 既存のモーダルがあれば削除
        const existingModal = document.getElementById('pricingModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div id="pricingModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 class="text-2xl font-bold text-gray-900">プランを選択</h3>
                        <button onclick="aiStockApp.closePricingModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                    </div>
                    
                    <div class="p-6">
                        <div class="grid md:grid-cols-3 gap-6">
                            ${this.generatePlanCards()}
                        </div>
                    </div>
                    
                    <div class="p-6 border-t border-gray-200 text-center text-sm text-gray-600">
                        <p>すべてのプランには30日間の返金保証が含まれています</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // モーダル外クリックで閉じる
        const modal = document.getElementById('pricingModal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePricingModal();
            }
        });
    }

    generatePlanCards() {
        // 環境変数から実際のPayPalプランIDを取得
        const plans = [
            {
                id: 'basic',
                name: 'ベーシック',
                price: 480,
                currency: 'JPY',
                paypalPlanId: import.meta.env.PAYPAL_BASIC_PLAN_ID || 'P-8G75275349810225FNCAGLNI',
                features: [
                    '基本的な株式分析',
                    '月間100件まで検索',
                    'メールサポート'
                ]
            },
            {
                id: 'standard',
                name: 'スタンダード',
                price: 1480,
                currency: 'JPY',
                paypalPlanId: import.meta.env.PAYPAL_STANDARD_PLAN_ID || 'P-82X42005YX321573ENCAGLNQ',
                popular: true,
                features: [
                    '高度な株式分析',
                    '月間500件まで検索',
                    'リアルタイム通知',
                    'チャットサポート'
                ]
            },
            {
                id: 'premium',
                name: 'プレミアム',
                price: 3980,
                currency: 'JPY',
                paypalPlanId: import.meta.env.PAYPAL_PREMIUM_PLAN_ID || 'P-18E538664T4008946NCAGLNQ',
                features: [
                    'プレミアム分析機能',
                    '無制限検索',
                    'AI予測レポート',
                    '専用サポート',
                    'API アクセス'
                ]
            }
        ];

        return plans.map(plan => `
            <div class="border rounded-lg p-6 relative ${plan.popular ? 'border-blue-500 border-2' : 'border-gray-200'}">
                ${plan.popular ? '<div class="absolute -top-3 left-1/2 transform -translate-x-1/2"><span class="bg-blue-500 text-white px-3 py-1 text-sm rounded-full">人気</span></div>' : ''}
                
                <h4 class="text-xl font-semibold mb-2">${plan.name}</h4>
                <div class="mb-4">
                    <span class="text-3xl font-bold">¥${plan.price.toLocaleString()}</span>
                    <span class="text-gray-600">/月</span>
                </div>
                
                <ul class="space-y-2 mb-6">
                    ${plan.features.map(feature => `
                        <li class="flex items-center text-sm">
                            <svg class="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                            </svg>
                            ${feature}
                        </li>
                    `).join('')}
                </ul>
                
                <div class="space-y-2">
                    <div id="paypal-button-${plan.id}" class="paypal-button-container"></div>
                    
                    ${plan.id === 'premium' ? `
                        <button onclick="aiStockApp.selectPlan('${plan.id}', 'invoice')" 
                                class="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded hover:bg-gray-200 transition-colors">
                            請求書で支払う
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async selectPlan(planId, paymentMethod) {
        console.log('Plan selected:', { planId, paymentMethod });
        
        if (paymentMethod === 'paypal') {
            await this.processPayPalPayment(planId);
        } else if (paymentMethod === 'invoice') {
            await this.createInvoice(planId);
        }
    }

    async processPayPalPayment(planId) {
        try {
            // PayPal SDKの動的読み込み
            if (!window.paypal) {
                await this.loadPayPalSDK();
            }

            const plan = this.getPlanById(planId);
            if (!plan) {
                throw new Error('プランが見つかりません');
            }

            // PayPalボタンをレンダリング
            const buttonContainer = document.getElementById(`paypal-button-${planId}`);
            if (buttonContainer) {
                buttonContainer.innerHTML = ''; // 既存のボタンをクリア

                window.paypal.Buttons({
                    style: {
                        shape: 'rect',
                        color: 'blue',
                        layout: 'vertical',
                        label: 'subscribe'
                    },
                    createSubscription: (data, actions) => {
                        return actions.subscription.create({
                            plan_id: plan.paypalPlanId
                        });
                    },
                    onApprove: async (data, actions) => {
                        console.log('PayPal subscription approved:', data);
                        await this.confirmSubscription(data.subscriptionID, planId, plan.name);
                    },
                    onError: (err) => {
                        console.error('PayPal error:', err);
                        this.showNotification('PayPal決済でエラーが発生しました', 'error');
                    },
                    onCancel: (data) => {
                        console.log('PayPal subscription cancelled:', data);
                        this.showNotification('決済がキャンセルされました', 'info');
                    }
                }).render(buttonContainer);
            }

        } catch (error) {
            console.error('PayPal payment processing error:', error);
            this.showNotification('PayPal決済の処理中にエラーが発生しました: ' + error.message, 'error');
        }
    }

    async loadPayPalSDK() {
        return new Promise((resolve, reject) => {
            if (window.paypal) {
                resolve(window.paypal);
                return;
            }

            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.getPayPalClientId()}&vault=true&intent=subscription`;
            script.onload = () => resolve(window.paypal);
            script.onerror = () => reject(new Error('PayPal SDK の読み込みに失敗しました'));
            document.head.appendChild(script);
        });
    }

    getPayPalClientId() {
        // 環境変数から取得（フロントエンド用）
        return import.meta.env.PAYPAL_CLIENT_ID || 'Af1Azw69JIUiM--lIMTHTPUkabuSMNyqhMcncuzWaeZ0z4lr73Tj66mxBpbNLylimKxdkJIFCPJn7sMC';
    }

    getPlanById(planId) {
        const plans = [
            {
                id: 'basic',
                name: 'ベーシック',
                price: 480,
                paypalPlanId: 'P-8G75275349810225FNCAGLNI'
            },
            {
                id: 'standard',
                name: 'スタンダード',
                price: 1480,
                paypalPlanId: 'P-82X42005YX321573ENCAGLNQ'
            },
            {
                id: 'premium',
                name: 'プレミアム',
                price: 3980,
                paypalPlanId: 'P-18E538664T4008946NCAGLNQ'
            }
        ];

        return plans.find(plan => plan.id === planId);
    }

    async confirmSubscription(subscriptionID, planId, planName) {
        try {
            this.showNotification('サブスクリプションを確認しています...', 'info');

            const response = await fetch('/api/paypal/subscription/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionID,
                    planId,
                    planName
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showNotification('サブスクリプションが正常に作成されました！', 'success');
                this.currentUser = { ...this.currentUser, plan: planId };
                localStorage.setItem('aistock_user', JSON.stringify(this.currentUser));
                this.closePricingModal();
            } else {
                throw new Error(result.error || 'サブスクリプションの確認に失敗しました');
            }

        } catch (error) {
            console.error('Subscription confirmation error:', error);
            this.showNotification('サブスクリプションの確認に失敗しました: ' + error.message, 'error');
        }
    }

    async createInvoice(planId) {
        try {
            this.showNotification('請求書を作成しています...', 'info');
            
            const response = await fetch('/api/paypal/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    planId: planId,
                    planName: 'プレミアムプラン',
                    amount: 3980,
                    currency: 'JPY',
                    productType: 'subscription'
                })
            });

            const result = await response.json();

            if (result.success && result.invoiceUrl) {
                window.open(result.invoiceUrl, '_blank', 'noopener,noreferrer');
                this.showNotification('請求書を作成しました。新しいウィンドウで確認してください。', 'success');
                this.closePricingModal();
            } else {
                throw new Error(result.error || '請求書の作成に失敗しました');
            }
        } catch (error) {
            console.error('Invoice creation error:', error);
            this.showNotification('請求書の作成に失敗しました: ' + error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        // 既存の通知を削除
        const existingNotification = document.getElementById('notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notificationHTML = `
            <div id="notification" class="fixed top-4 right-4 z-50 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full">
                <div class="flex items-center">
                    <span>${message}</span>
                    <button onclick="document.getElementById('notification').remove()" class="ml-4 text-white hover:text-gray-200">&times;</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', notificationHTML);

        // アニメーション
        setTimeout(() => {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.style.transform = 'translateX(0)';
            }
        }, 100);

        // 5秒後に自動削除
        setTimeout(() => {
            const notification = document.getElementById('notification');
            if (notification) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    showUserMenu() {
        console.log('User menu clicked');
        // ユーザーメニューの実装
    }
}

// アプリケーションの初期化
const aiStockApp = new AIStockApp();

// グローバルスコープに公開（HTML内のonclickイベント用）
window.aiStockApp = aiStockApp;
