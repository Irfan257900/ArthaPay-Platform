import React from 'react'

const BackToDetails = (props) => {
    return <div className="text-2xl font-semibold text-titleColor">
        {props.mode !== 'add' && (
            <button className="btn-plane" onClick={props.navigateToView}>
                <span className="icon lg btn-arrow-back c-pointer"></span>
            </button>
        )}
       {props.mode !== "add" && <span className="text-2xl font-semibold text-titleColor m-0">
             Update {props.screen} Address
        </span>}
    </div>

}

export default BackToDetails