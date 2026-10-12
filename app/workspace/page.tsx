import {TraderPage} from "@/components/TraderUI";
import {TraderWorkspace} from "@/components/TraderWorkspace";
export const metadata={title:"我的交易",description:"接續此裝置的交易計畫與紀錄。",robots:{index:false,follow:true}};
export default function Page(){return <TraderPage kicker="MY WORKSPACE" title="你的交易，從這裡接續。" copy="計畫與結果放在一起；每次使用先核對資料範圍。"><TraderWorkspace/></TraderPage>}
