const { createApp } = Vue;

const API_BASE = 'http://localhost:8080/api';

const app = createApp({
    data() {
        return {
            currentUser: null,
            loginForm: {
                username: '',
                password: ''
            },
            registerForm: {
                username: '',
                nickname: '',
                birthday: '',
                password: ''
            },
            showRegister: false,
            activeTab: 'my',
            myWishlists: [],
            selectedWishlist: null,
            items: [],
            showAddWishlist: false,
            newWishlist: {
                title: '',
                description: '',
                isPublic: 1
            },
            showAddItem: false,
            newItem: {
                title: '',
                description: '',
                url: '',
                imageUrl: '',
                price: null,
                priority: 1
            },
            friends: [],
            selectedFriendId: '',
            friendWishlists: [],
            selectedFriendWishlist: null,
            friendItems: [],
            recordType: 'myClaims',
            myClaims: [],
            othersClaims: [],
            newFriendId: '',
            showClaimModal: false,
            claimingItem: null,
            claimMessage: ''
        };
    },
    mounted() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.loadData();
        }
    },
    methods: {
        async login() {
            try {
                const res = await axios.post(`${API_BASE}/users/login`, this.loginForm);
                if (res.data.code === 200) {
                    this.currentUser = res.data.data;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    this.loadData();
                } else {
                    alert(res.data.message);
                }
            } catch (e) {
                alert('登录失败，请检查后端服务是否启动');
                console.error(e);
            }
        },
        async register() {
            try {
                const res = await axios.post(`${API_BASE}/users/register`, this.registerForm);
                if (res.data.code === 200) {
                    alert('注册成功，请登录');
                    this.showRegister = false;
                    this.registerForm = { username: '', nickname: '', birthday: '', password: '' };
                } else {
                    alert(res.data.message);
                }
            } catch (e) {
                alert('注册失败');
                console.error(e);
            }
        },
        logout() {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.loginForm = { username: '', password: '' };
        },
        async loadData() {
            await this.loadMyWishlists();
            await this.loadFriends();
            await this.loadClaims();
        },
        async loadMyWishlists() {
            try {
                const res = await axios.get(`${API_BASE}/wishlists/user/${this.currentUser.id}`);
                if (res.data.code === 200) {
                    this.myWishlists = res.data.data;
                }
            } catch (e) {
                console.error('加载心愿单失败', e);
            }
        },
        async createWishlist() {
            if (!this.newWishlist.title) {
                alert('请输入标题');
                return;
            }
            try {
                const res = await axios.post(`${API_BASE}/wishlists`, {
                    ...this.newWishlist,
                    userId: this.currentUser.id
                });
                if (res.data.code === 200) {
                    this.showAddWishlist = false;
                    this.newWishlist = { title: '', description: '', isPublic: 1 };
                    this.loadMyWishlists();
                }
            } catch (e) {
                console.error('创建心愿单失败', e);
            }
        },
        async deleteWishlist(id) {
            if (!confirm('确定删除这个心愿单吗？')) return;
            try {
                await axios.delete(`${API_BASE}/wishlists/${id}`);
                this.loadMyWishlists();
                if (this.selectedWishlist && this.selectedWishlist.id === id) {
                    this.selectedWishlist = null;
                    this.items = [];
                }
            } catch (e) {
                console.error('删除心愿单失败', e);
            }
        },
        async selectWishlist(wishlist) {
            this.selectedWishlist = wishlist;
            try {
                const res = await axios.get(`${API_BASE}/items/wishlist/${wishlist.id}`);
                if (res.data.code === 200) {
                    this.items = res.data.data;
                }
            } catch (e) {
                console.error('加载商品失败', e);
            }
        },
        async fetchMetadata() {
            if (!this.newItem.url) return;
            try {
                const res = await axios.get(`${API_BASE}/metadata/fetch`, {
                    params: { url: this.newItem.url }
                });
                if (res.data.code === 200 && res.data.data) {
                    const meta = res.data.data;
                    if (!this.newItem.title && meta.title) {
                        this.newItem.title = meta.title;
                    }
                    if (!this.newItem.description && meta.description) {
                        this.newItem.description = meta.description;
                    }
                    if (meta.imageUrl) {
                        this.newItem.imageUrl = meta.imageUrl;
                    }
                }
            } catch (e) {
                console.error('抓取元数据失败', e);
            }
        },
        async addItem() {
            if (!this.newItem.title) {
                alert('请输入标题');
                return;
            }
            try {
                const res = await axios.post(`${API_BASE}/items`, {
                    ...this.newItem,
                    wishlistId: this.selectedWishlist.id
                });
                if (res.data.code === 200) {
                    this.showAddItem = false;
                    this.newItem = { title: '', description: '', url: '', imageUrl: '', price: null, priority: 1 };
                    this.selectWishlist(this.selectedWishlist);
                }
            } catch (e) {
                console.error('添加商品失败', e);
            }
        },
        async deleteItem(id) {
            if (!confirm('确定删除这个商品吗？')) return;
            try {
                await axios.delete(`${API_BASE}/items/${id}`);
                this.selectWishlist(this.selectedWishlist);
            } catch (e) {
                console.error('删除商品失败', e);
            }
        },
        async loadFriends() {
            try {
                const res = await axios.get(`${API_BASE}/friendships/${this.currentUser.id}/friends`);
                if (res.data.code === 200) {
                    this.friends = res.data.data;
                }
            } catch (e) {
                console.error('加载好友失败', e);
            }
        },
        async loadFriendWishlists() {
            if (!this.selectedFriendId) {
                this.friendWishlists = [];
                this.selectedFriendWishlist = null;
                this.friendItems = [];
                return;
            }
            try {
                const res = await axios.get(`${API_BASE}/wishlists/user/${this.selectedFriendId}`);
                if (res.data.code === 200) {
                    this.friendWishlists = res.data.data.filter(w => w.isPublic === 1);
                }
            } catch (e) {
                console.error('加载好友心愿单失败', e);
            }
        },
        async selectFriendWishlist(wishlist) {
            this.selectedFriendWishlist = wishlist;
            try {
                const res = await axios.get(`${API_BASE}/items/wishlist/${wishlist.id}`);
                if (res.data.code === 200) {
                    this.friendItems = res.data.data;
                }
            } catch (e) {
                console.error('加载好友商品失败', e);
            }
        },
        claimItem(item) {
            this.claimingItem = item;
            this.claimMessage = '';
            this.showClaimModal = true;
        },
        async confirmClaim() {
            try {
                const res = await axios.post(`${API_BASE}/items/${this.claimingItem.id}/claim`, {
                    userId: this.currentUser.id,
                    ownerId: this.selectedFriendId,
                    message: this.claimMessage
                });
                if (res.data.code === 200) {
                    alert('领取成功！');
                    this.showClaimModal = false;
                    this.selectFriendWishlist(this.selectedFriendWishlist);
                    this.loadClaims();
                } else {
                    alert(res.data.message);
                }
            } catch (e) {
                console.error('领取失败', e);
                alert('领取失败');
            }
        },
        async loadClaims() {
            try {
                const myRes = await axios.get(`${API_BASE}/claim-records/user/${this.currentUser.id}`);
                if (myRes.data.code === 200) {
                    this.myClaims = myRes.data.data;
                }
                const othersRes = await axios.get(`${API_BASE}/claim-records/owner/${this.currentUser.id}`);
                if (othersRes.data.code === 200) {
                    this.othersClaims = othersRes.data.data;
                }
            } catch (e) {
                console.error('加载领取记录失败', e);
            }
        },
        async addFriend() {
            if (!this.newFriendId || this.newFriendId == this.currentUser.id) {
                alert('请输入有效的用户ID');
                return;
            }
            try {
                const res = await axios.post(`${API_BASE}/friendships`, {
                    userId: this.currentUser.id,
                    friendId: this.newFriendId
                });
                if (res.data.code === 200) {
                    alert('添加好友成功！');
                    this.newFriendId = '';
                    this.loadFriends();
                } else {
                    alert(res.data.message);
                }
            } catch (e) {
                console.error('添加好友失败', e);
                alert('添加好友失败');
            }
        },
        isBirthdaySoon(birthday) {
            if (!birthday) return false;
            const now = new Date();
            const bday = new Date(birthday);
            bday.setFullYear(now.getFullYear());
            if (bday < now) {
                bday.setFullYear(now.getFullYear() + 1);
            }
            const diffDays = Math.ceil((bday - now) / (1000 * 60 * 60 * 24));
            return diffDays <= 30 && diffDays >= 0;
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleString('zh-CN');
        }
    }
});

app.mount('#app');
