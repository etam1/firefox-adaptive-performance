import "./APHeader.css"
import MemoryPopUp from '../PopUps/MemoryPopUp/MemoryPopUp';
import SwitchDemo from "../Switch/Switch";

export default function APHeader() {
    return (
        <div className="APHeaderText">
            
            <div className="APHeaderTitleBar">
                <div className="APHeaderTitlePopUp">
                    <p className="APHeaderTitle">Adaptive Performance</p>
                    <MemoryPopUp variant="low" />
                </div>

                <SwitchDemo />
            </div>
            

            <p className="APHeaderSubtitle">                
                <span className="status">Status:</span>  
                <span className="active"> Active</span>
                , 
                Sleeping Tabs, 
                Lowering FPS</p>

        </div>
    )
}