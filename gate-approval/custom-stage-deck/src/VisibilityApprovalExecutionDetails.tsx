import React, { Fragment, useCallback, useMemo, useState } from 'react';
import Modal from 'react-modal';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';
import './VisibilityApproval.less';

/*
 * You can use this component to provide information to users about
 * how the stage was configured and the results of its execution.
 *
 * In general, you will access two properties of `props.stage`:
 * - `props.stage.outputs` maps to your SimpleStage's `Output` class.
 * - `props.stage.context` maps to your SimpleStage's `Context` class.
 */

export function VisibilityApprovalExecutionDetails(props: IExecutionDetailsSectionProps) {
  console.log("Approval Gate Execution");
  console.log(props);

  const [modalIsOpen,setModalIsOpen] = useState(false);
  const [approvalStatusPopup,setApprovalStatusPopup] = useState(false);

  const getClasses = () => {
    let classes = '';
    if (props.stage.outputs.status == 'approved') {
      classes = 'approvalStatusSuccess';
    } else if (props.stage.outputs.status == 'rejected') {
      classes = 'approvalStatusDanger';
    }
    return classes;
  };

  const getStatus = () => {
    let classes = '';
    if (props.stage.outputs.status == 'approved') {
      classes = 'Approved';
    } else if (props.stage.outputs.status == 'rejected') {
      classes = 'Rejected';
    }
    return classes;
  };
  const exceptionDiv = props.stage.outputs.exception ? (
    <div className="alert alert-danger">
      <div>
        <h5>Exception </h5>
        <div className="Markdown break-word">
          <p>{props.stage.outputs.exception}</p>
        </div>
      </div>
    </div>
  ) : null;

  const setModalIsOpenToTrue =()=>{
      setModalIsOpen(true)
  }

  const setModalIsOpenToFalse =()=>{
      setModalIsOpen(false);      
  }

    const openApprovalDetails =()=>{
      setApprovalStatusPopup(true)
  }

  const closeApprovalDetails =()=>{
      setApprovalStatusPopup(false);      
  }

  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      {props.stage.outputs.exception == undefined && props.stage.outputs.status !== undefined ? (
        <div>
          <div className="detailpagelogo">

          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Comment</th>
                <th>Last Updated</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className={'approvalStatusSmall ' + getClasses()}>{getStatus()}</span>
                </td>
                <td>
                  <div className={'approvalCommentSection'}>{props.stage.outputs.comments}</div>
                </td>
                <td>{new Date(props.stage.endTime).toLocaleString()}</td>
                <td>
                   {/* <span className={'clikable approvalStatus ' + getClasses()} onClick={set ModalIsOpenToTrue}>View Details</span> */}
                   <a className="clikable" onClick={openApprovalDetails}>
                     <span>View</span>
                   </a>
                    <Modal id="approval-exe-modal2" isOpen={approvalStatusPopup} className="modal-popup-approval modal-dialog" overlayClassName="react-modal-custom">
                      <div className="modal-content">
                        <div className="modal-header">                      
                          <button onClick={closeApprovalDetails} className="close">
                            <span>x</span>
                          </button>
                          <h4 className="modal-title">Approval Details</h4>
                        </div>                                      
                        <div className="grid-span-4 modal-body">
                        <iframe id="templateFrame" src={props.stage.outputs.navigationalURL} title="ISD">
                        </iframe>
                        </div>                    
                      </div>
                    </Modal>    
                  </td>
              </tr>
            </tbody>
          </table>
            <img
              src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
              alt="logo"
              width="70px"
            ></img>
          </div>
          {exceptionDiv}
        </div>
      ) : props.stage.outputs.navigationalURL !== undefined? (
        <div>
          <div className="detailpagelogo">

            <a className='activeBtn'  onClick={setModalIsOpenToTrue}>
                      Approval Request
            </a>

            <Modal id="approval-exe-modal" isOpen={modalIsOpen} className="modal-popup-approval modal-dialog" overlayClassName="react-modal-custom">
              <div className="modal-content">
                <div className="modal-header">                      
                  <button onClick={setModalIsOpenToFalse} className="close">
                    <span>x</span>
                  </button>
                  <h4 className="modal-title"> Approval Request</h4>
                </div>                                      
                <div className="grid-span-4 modal-body">
                <iframe id="templateFrame" src={props.stage.outputs.navigationalURL} title="ISD">
                </iframe>
                </div>                    
              </div>
            </Modal>    


          </div>
        </div>
      ) :(
        <>
          {' '}
          <img
            src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
            alt="logo"
            width="80px"
            style={{ float: 'right', marginBottom: '10px' }}
          ></img>
          <StageFailureMessage stage={props.stage} message={props.stage.failureMessage} />
        </>
      )}
    </ExecutionDetailsSection>
  );
}

// The title here will be used as the tab name inside the
// pipeline stage execution view. Camel case will be mapped
// to space-delimited text: randomWait -> Random Wait.
export namespace VisibilityApprovalExecutionDetails {
  export const title = 'Approval';
}
