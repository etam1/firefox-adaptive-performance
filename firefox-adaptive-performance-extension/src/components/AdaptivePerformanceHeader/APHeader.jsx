import "./APHeader.css"
import SwitchDemo from "../Switch/Switch";
import APPopUp from "../PopUps/APPopUp/APPopUp";

export default function APHeader({ showSuggestedActions, setShowSuggestedActions }) {
    return (
        <div className="APHeaderText">

            <div className="APHeaderTitleBar">
                <div className="APHeaderTitlePopUp">
                    <p className="APHeaderTitle">Adaptive Performance</p>
                    <APPopUp variant="on" />
                </div>

                <SwitchDemo
                    checked={showSuggestedActions}
                    onCheckedChange={setShowSuggestedActions} />
            </div>


            {showSuggestedActions && (
                <p className="APHeaderSubtitle">
                    <span className="status">Status:</span>
                    <span className="active"> Active</span>
                    ,
                    Sleeping Tabs,
                    Lowering FPS</p>
            )}

        </div>
    )
}