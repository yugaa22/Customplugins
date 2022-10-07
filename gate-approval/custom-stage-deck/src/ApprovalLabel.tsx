import React, { useState } from 'react';
import { HoverablePopover, Tooltip, IExecutionStageLabelProps, ExecutionBarLabel } from '@spinnaker/core';
import { ApprovalRequestModal } from './ApprovalRequestModal';



export function ApprovalLabel(props: IExecutionStageLabelProps) {
  console.log("Approval Label", props)
  const [modalOpen, setModalOpen] = useState(false);

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
          <HoverablePopover template={template}> {props?.children}</HoverablePopover>
          {
            modalOpen && <ApprovalRequestModal stage={props.stage.stages[0]} modalOpen={modalOpen} setModalIsOpenToFalse={() => setModalOpen(false)} />
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