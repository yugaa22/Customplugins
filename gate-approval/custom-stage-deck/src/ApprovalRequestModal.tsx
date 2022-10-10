import React from 'react';
import Modal from 'react-modal';
import { Tooltip } from '@spinnaker/core';

export function ApprovalRequestModal(props:any){

    return(
        <Modal id="approval-exe-modal" isOpen={props.modalOpen} className="modal-popup-approval modal-dialog" overlayClassName="react-modal-custom">
        <div className="modal-content">
        <Tooltip value="Open in a new tab" placement="left">
          <a href={props.stage.outputs.navigationalURL} target="_blank" className="open-new-tab"></a>               
        </Tooltip>
          <div className="modal-close close-button pull-right">
            <button onClick={props.setModalIsOpenToFalse} className="link">
              <span className="glyphicon glyphicon-remove close-button-popup"></span>
            </button>
          </div>
          <div className="modal-header">
            <h4 className="modal-title"> Approval Request</h4>
          </div>                                      
          <div className="grid-span-4 modal-body">
          <iframe id="templateFrame" src={props.stage.outputs.navigationalURL} title="ISD">
          </iframe>
          </div>                    
        </div>
      </Modal>    
    )
}