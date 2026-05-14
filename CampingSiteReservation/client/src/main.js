import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  Lazyload,
  Button,
  Cell,
  CellGroup,
  Image,
  NavBar,
  Tabbar,
  TabbarItem,
  Tab,
  Tabs,
  List,
  Icon,
  Grid,
  GridItem,
  Card,
  Tag,
  Swipe,
  SwipeItem,
  Field,
  Calendar,
  Popup,
  Picker,
  SubmitBar,
  Checkbox,
  CheckboxGroup,
  Rate,
  Empty,
  Loading,
  PullRefresh,
  SwipeCell,
  Dialog,
  Toast,
  NoticeBar,
  ActionSheet,
  Stepper
} from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Lazyload)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Image)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Tab)
app.use(Tabs)
app.use(List)
app.use(Icon)
app.use(Grid)
app.use(GridItem)
app.use(Card)
app.use(Tag)
app.use(Swipe)
app.use(SwipeItem)
app.use(Field)
app.use(Calendar)
app.use(Popup)
app.use(Picker)
app.use(SubmitBar)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(Rate)
app.use(Empty)
app.use(Loading)
app.use(PullRefresh)
app.use(SwipeCell)
app.use(Dialog)
app.use(Toast)
app.use(NoticeBar)
app.use(ActionSheet)
app.use(Stepper)

app.mount('#app')
