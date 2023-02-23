import React, { useEffect, useState } from 'react';
import { HoverablePopover, Tooltip, IExecutionStageLabelProps, ExecutionBarLabel, SETTINGS } from '@spinnaker/core';
import { ApprovalRequestModal } from './ApprovalRequestModal';



export function ApprovalLabel(props: IExecutionStageLabelProps) {
  console.log("Approval Label", props)
  const [modalOpen, setModalOpen] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState('');


  let isdUrl =  '';
  useEffect(()=>{
    if(window && window.uiUrl){
      isdUrl = window.uiUrl;
    }
    else if(SETTINGS.gateUrl && (SETTINGS.gateUrl !="/gate/" && SETTINGS.gateUrl !="/gate")){
      let gateurl = SETTINGS.gateUrl;
      if(gateurl.endsWith('/gate') || gateurl.endsWith('/gate/')){
       gateurl = gateurl.replace('/gate','');
      }
      isdUrl = gateurl;
    }
    else{
      isdUrl = window.location.origin;
    }
    if(props.stage.stages[0].outputs.navigationalURL !== undefined){
      if(props.stage.stages[0].outputs.navigationalURL.startsWith('http')){
        let modifiedUrl = props.stage.stages[0].outputs.navigationalURL.replace(/^http[s]?:\/\/.+?\//, '/');
        setApprovalUrl(`${isdUrl}${modifiedUrl}`)
      }else{
        setApprovalUrl(`${isdUrl}${props.stage.stages[0].outputs.navigationalURL}`)
      }
    }

  },[props.stage.stages[0].outputs.navigationalURL])

  const handleApprovalClick = (event: any) => {
    setModalOpen(true)
  };

  const template = (
    <div>
      <div style={{paddingBottom: '2px'}}>
        <b>{props.stage.name}</b>
        </div>
        <div>
        <button
          className="btn btn-primary"
          onClick={handleApprovalClick}
        >
          View Approval Request
        </button>
        </div>
    </div>
  );

  return (
    <>
      {props.stage.isRunning ? (
        <>
          <HoverablePopover delayHide={0} delayShow={0} template={template}>{props?.children}</HoverablePopover>
          {
            modalOpen && <ApprovalRequestModal approvalUrl={approvalUrl} stage={props.stage.stages[0]} modalOpen={modalOpen} setModalIsOpenToFalse={() => setModalOpen(false)} />
          }
        </>
      ) : (
        <>
          <Tooltip id={props.stage.id} value={props.stage.name}>
            <span>{props?.children}</span>
          </Tooltip>
        </>
      )}
    </>
  )
}