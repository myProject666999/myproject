import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { Button, Form, Field, CellGroup, NavBar, Tabbar, TabbarItem, List, Cell, PullRefresh, Toast, Dialog, Popup, Picker, DatePicker, TimePicker, Rate, Tag, Image as VanImage, Icon, Empty, Loading, Overlay, Swipe, SwipeItem, Grid, GridItem, Card, Stepper, SubmitBar, ActionSheet, NoticeBar, Calendar, RadioGroup, Radio, SwipeCell, Steps, Step, Area, Switch, Tabs, Tab } from 'vant'
import 'vant/lib/index.css'
import './styles/index.scss'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(Button)
app.use(Form)
app.use(Field)
app.use(CellGroup)
app.use(NavBar)
app.use(Tabbar)
app.use(TabbarItem)
app.use(List)
app.use(Cell)
app.use(PullRefresh)
app.use(Toast)
app.use(Dialog)
app.use(Popup)
app.use(Picker)
app.use(DatePicker)
app.use(TimePicker)
app.use(Rate)
app.use(Tag)
app.use(VanImage)
app.use(Icon)
app.use(Empty)
app.use(Loading)
app.use(Overlay)
app.use(Swipe)
app.use(SwipeItem)
app.use(Grid)
app.use(GridItem)
app.use(Card)
app.use(Stepper)
app.use(SubmitBar)
app.use(ActionSheet)
app.use(NoticeBar)
app.use(Calendar)
app.use(RadioGroup)
app.use(Radio)
app.use(SwipeCell)
app.use(Steps)
app.use(Step)
app.use(Area)
app.use(Switch)
app.use(Tabs)
app.use(Tab)

app.mount('#app')
