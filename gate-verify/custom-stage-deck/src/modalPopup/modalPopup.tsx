import React from 'react';
import { Button, Modal } from 'react-bootstrap';


import './modalPopup.less';

export interface ISampleModalState {
  loading: boolean;
}

export interface ISampleModalProps {
  show: boolean;
  showCallback: (show: boolean) => void;
  applicationId : string;
}

export class ModalPopup extends React.Component<ISampleModalProps, ISampleModalState> {
  constructor(props: ISampleModalProps) {
    super(props);
    this.state = this.getDefaultState();
  }

  private getDefaultState(): ISampleModalState {
    return {
      loading: false
    };
  }

  public close = (evt?: React.MouseEvent<any>): void => {
    evt && evt.stopPropagation();
    this.setState(this.getDefaultState());
    this.props.showCallback(false);
  };

  public render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.close}
        className="sample-modal-overflow-visible"
        backdrop="static"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>Sample Modal Popup</Modal.Title>
        </Modal.Header>
        {this.state.loading && (
          <Modal.Body style={{ height: '600px', width : '900px' }}>
           Test Test Test Test
          </Modal.Body>
        )}
        {!this.state.loading && (
          <Modal.Body>
            <div className="form-group clearfix">
                <div className="col-md-12">
                  Test Test
                  {/* <iframe src="https://ui.gitops-test.dev.opsmx.net/ui/application/deploymentverification" title="ISD" width="900" height="600">
                  </iframe> */}
                </div>
            </div>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button onClick={this.close}>Cancel</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

