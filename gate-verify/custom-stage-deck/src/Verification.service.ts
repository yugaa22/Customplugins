import { REST } from '@spinnaker/core';



export class VerificationService {

  public static getMetricListDummy(): PromiseLike<any> {    
    //return fetch('https://reqres.in/api/users?page=2').;
    return fetch("https://reqres.in/api/users?page=2")
      .then(res => res.json())
      .then(
        (result) => {
          return result.data;
        },        
        (error) => {
          console.log(error);
        }
      )
  }

  public static getMetricList(): PromiseLike<any> {  
    return REST("autopilot/api/v1/applications/81/metricTemplates").path().get();
  }

  public static getLogTemplateList(): PromiseLike<any> {  
    return REST("autopilot/api/v1/applications/6/logTemplates").path().get();
  }
  

  
}
