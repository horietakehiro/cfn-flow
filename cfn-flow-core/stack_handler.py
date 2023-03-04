import json
import boto3
from copy import deepcopy

stepfunctions = boto3.client("stepfunctions")

class CfnStackHandler(object):

    _sample_event = {
        "TaskToken": "string",
        "OperationType": "UPSERT", # or DELETE or WAIT
        "StackRegion": "string",
        "CfnFlowParameters": [
            {
                'ParameterKey': 'string',
                'ParameterValue': 'string',
                "SourceConfig": {
                    "Type": "cfn",
                    "Arn": "string",
                    "Selector": "Outputs.VPCID"
                }
            }
        ],
        "StackInput": {
            "StackName": "string",
            "TemplateURL": "https://string",
            # "Parameters": [
            #     {
            #     'ParameterKey': 'string',
            #     'ParameterValue': 'string',
            #     'UsePreviousValue': bool,
            #     }
            # ],
            "DisableRollback": bool,
            "TimeoutInMinutes": int,
            "Capabilities" : [ "CAPABILITY_IAM", "CAPABILITY_NAMED_IAM", "CAPABILITY_AUTO_EXPAND"],
            "RoleARN": "arn:string",
            "Tags" : [
                {
                    'Key': 'string',
                    'Value': 'string'
                },
            ],
        }
    }

    OP_UPSERT = "UPSERT"
    OP_DELETE = "DELETE"
    OP_CREATE = "CREATE"
    OP_UPDATE = "UPDATE"
    OP_WAIT = "WAIT"

    def __init__(self, event:dict, context=None) -> None:
        self.client = boto3.client("cloudformation", event.get("StackRegion"))
        self.stack_input:dict = event.get("StackInput")
        self.operation_type:str = event.get("OperationType")
        self.task_token:str = event.get("TaskToken", None)
        self.cfn_flow_parameters = event.get("CfnFlowParameters", [])

        self.is_success:bool = False

    def resolve_parameter_values(self):
        resolved_parameters = []
        try:
            for param in self.cfn_flow_parameters:
                print(param)
                source_config = param.get("SourceConfig", {})

                if source_config.get("Type", "") != "cfn":
                    resolved_parameters.append({
                        "ParameterKey": param.get("ParameterKey"),
                        "ParameterValue": param.get("ParameterValue")
                    })
                    continue

                region = source_config.get("Arn").split(":")[3]
                stack_name = source_config.get("Arn").split("/")[-1]
                client = boto3.client("cloudformation", region_name=region)
                res = client.describe_stacks(StackName=stack_name)

                stack = res["Stacks"][0]
                print(stack)
                section, key = source_config.get("Selector").split(".")
                value = [o["OutputValue"] for o in stack[section] if o["OutputKey"] == key][0]

                resolved_parameters.append({
                    "ParameterKey": param.get("ParameterKey"),
                    "ParameterValue": value,
                })

        except Exception as ex:
            raise ex

        print(resolved_parameters)
        self.stack_input["Parameters"] = resolved_parameters

    def create(self) -> dict:

        self.resolve_parameter_values()

        # modify inputs
        for param in self.stack_input["Parameters"]:
            print(param)
            try:
                _ = param.pop("UsePreviousValue")
            except KeyError:
                pass

        try:
            res = self.client.create_stack(
                **self.stack_input
            )
            res = self.client.describe_stacks(
                StackName=self.stack_input["StackName"]
            )
        except Exception as ex:
            raise ex

    def update(self) -> dict:
        self.resolve_parameter_values()

        try:
            _ = self.stack_input.pop("TimeoutInMinutes")
        except KeyError:
            pass

        try:
            res = self.client.update_stack(
                **self.stack_input
            )
            res = self.client.describe_stacks(
                StackName=self.stack_input["StackName"]
            )
            return res["Stacks"][0]
        except Exception as ex:
            if "No updates are to be performed" in str(ex):
                pass
            raise ex

    def delete(self) -> dict:
        try:
            stack_input = {
                "StackName": self.stack_input["StackName"],
                "RoleARN": self.stack_input["RoleARN"],
            }
            self.client.delete_stack(
                **stack_input
            )
            res = self.client.describe_stacks(
                StackName=stack_input["StackName"]
            )

            return res["Stacks"][0]
        except Exception as ex:
            if f"Stack with id {self.stack_input['StackName']} does not exist" in str(ex):
                return {
                    "StackStatus": "DELETE_COMPLETE"
                }
            raise ex


    def determin_operation_type(self) -> str:
        op = self.operation_type
        if op == self.OP_UPSERT:
            op = self.OP_CREATE
            try:
                stack_name:str = self.stack_input.get("StackName")
                res = self.client.describe_stacks(
                    StackName=stack_name,
                )
                if len(res["Stacks"]) != 0:
                    op = self.OP_UPDATE
            except Exception as ex:
                if f"Stack with id {stack_name} does not exist" in str(ex):
                    pass
                else:
                    raise ex

        print(f"{op=}")
        return op

    def wait(self):
        try:
            res = self.client.describe_stacks(
                StackName=self.stack_input["StackName"]
            )
            return res["Stacks"][0]
        except Exception as ex:
            if f"Stack with id {self.stack_input['StackName']} does not exist" in str(ex):
                return {
                    "StackStatus": "DELETE_COMPLETE"
                }
            raise ex

    def main(self):
        try:
            op = self.determin_operation_type()

            if op == self.OP_CREATE:
                res = self.create()
            if op == self.OP_UPDATE:
                res = self.update()
            if op == self.OP_DELETE:
                res = self.delete()
            if op == self.OP_WAIT:
                res = self.wait()

            if self.task_token is None:
                return

            stepfunctions.send_task_success(
                taskToken=self.task_token,
                output=json.dumps(res, default=str)
            )

        except Exception as ex:
            stepfunctions.send_task_failure(
                taskToken=self.task_token,
                error="500",
                cause=str(ex),
            )
            

def lambda_handler(event:dict, context):

    print(event)

    h = CfnStackHandler(event=event, context=context)

    h.main()