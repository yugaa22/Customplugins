import React, { useState } from 'react';
import Modal from 'react-modal';

import { ExecutionDetailsSection, IExecutionDetailsSectionProps, StageFailureMessage } from '@spinnaker/core';

/*
 * You can use this component to provide information to users about
 * how the stage was configured and the results of its execution.
 *
 * In general, you will access two properties of `props.stage`:
 * - `props.stage.outputs` maps to your SimpleStage's `Output` class.
 * - `props.stage.context` maps to your SimpleStage's `Context` class.
 */
export function PolicyGateExecutionDetails(props: IExecutionDetailsSectionProps) {
  console.log("Policy Execution");
  console.log(props);
  const [modalIsOpen,setModalIsOpen] = useState(false);
  const getClasses = () => {
    let classes = '';
    if (props.stage.outputs.status == 'allow') {
      classes = 'policyStatusSuccess';
    } else if (props.stage.outputs.status == 'deny') {
      classes = 'policyStatusDanger';
    }
    return classes;
  };

  const getStatus = () => {
    let classes = '';
    if (props.stage.outputs.status == 'allow') {
      classes = 'Allow';
    } else if (props.stage.outputs.status == 'deny') {
      classes = 'Deny';
    }
    return classes;
  };

  const exceptionDiv = props.stage.outputs.exception ? (
    <div className="alert alert-danger">
      <div>
        <h5>Exception</h5>
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


  return (
    <ExecutionDetailsSection name={props.name} current={props.current}>
      {props.stage.outputs.trigger_json !== undefined ? (
        <div>
          <div className="detailpagelogo">
            <img
              src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
              alt="logo"
              width="70px"
              style={{ marginLeft: 'auto' }}
            ></img>
          </div>
          <table className="table" style={{ marginTop: '15px' }}>
            <thead>
              <tr>
                <th>Status</th>
                <th>Message</th>
                <th style={{ width: '90px' }}>Executed By</th>
                <th>Time</th>
                <th>Policy Name</th>
                <th>Policy Link</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span className={'PolicyStatusSmall ' + getClasses()}>{getStatus()}</span>
                </td>
                <td>{props.stage.outputs.message}</td>
                <td>{props.stage.outputs.executedBy}</td>
                <td>{new Date(props.stage.endTime).toLocaleString()}</td>
                <td>Name</td>
                <td><span className={'clikable PolicyStatusSmall ' + getClasses()} onClick={setModalIsOpenToTrue}>View</span>
                <Modal id="verification-exe-modal" isOpen={modalIsOpen} className="modal-popup modal-dialog" overlayClassName="react-modal-custom">
                  <div className="modal-content">
                    <div className="modal-header">                      
                      <button onClick={setModalIsOpenToFalse} className="close">
                        <span>x</span>
                      </button>
                      <h4 className="modal-title">Policy Details</h4>
                    </div>                                      
                    <div className="grid-span-4 modal-body">
                    <iframe src={ window.location.origin + "/ui/setup" + props.stage.outputs.policyLink +"/true"} title="ISD" width="1100" height="650">
                    </iframe>
                    </div>                    
                  </div>
                </Modal>      
                </td>
              </tr>
            </tbody>
          </table>
          {exceptionDiv}
        </div>
      ) : (
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
export namespace PolicyGateExecutionDetails {
  export const title = 'Policy';
}
