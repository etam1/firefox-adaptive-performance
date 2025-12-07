import "./CPUMemoryBars.css";
import ResourceCard from "../MemoryCPUBars/ResourceCard";

export default function CPUMemoryBars() {
    return (
        <div className="TextandBars">

            <p className="Title">Browser Usage</p>

            <div className="ResourceCards">
                <ResourceCard label="Memory" usedPercent={75} totalMb={500} savingPercent={23} barColor="#E02950" />
                <ResourceCard label="CPU" usedPercent={15} totalMb={500} savingPercent={67} barColor="#005E5D" />
            </div>
        </div>
    )
}