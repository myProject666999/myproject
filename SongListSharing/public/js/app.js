const { createApp, ref, computed, reactive } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: window.SquarePage },
    { path: '/login', component: window.LoginPage },
    { path: '/register', component: window.RegisterPage },
    { path: '/create', component: window.CreatePlaylistPage },
    { path: '/my/playlists', component: window.MyPlaylistsPage },
    { path: '/user/:id', component: window.UserProfilePage },
    { path: '/playlist/:id', component: window.PlaylistDetailPage },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

const app = createApp({
  components: {
    'audio-player': window.AudioPlayer
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || 'null')
    };
  },
  computed: {
    isLoggedIn() { return !!this.currentUser; }
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.currentUser = null;
      this.$router.push('/');
    },
    setUser(user) {
      this.currentUser = user;
    }
  }
});

app.component('audio-player', window.AudioPlayer);
app.use(router);
app.mount('#app');
