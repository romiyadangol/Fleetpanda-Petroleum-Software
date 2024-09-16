import { gql } from "@apollo/client";

 export const CREATE_DELIVERY = gql`
mutation CreateOrder($orderGroupInfo: OrderGroupInput!) {
  createOrder(input: {
    orderGroupInfo: $orderGroupInfo
  }) {
    order {
			id
      status
      startedAt
      completedAt
      customer {
				id
				name
				email
			}
      organizationId
			userId
			recurring {
				frequency
				startedAt
				endAt
			}
			deliveryOrder {
				id
				plannedAt
				completedAt
				customerBranch {
					id
					name
					location
				}
				orderGroupId
				asset{
					id
					assetId
					assetCategory
				}
				driver{
					id 
					name
					email
				}
				lineItems {
					id
					name
					quantity
					units
					deliveryOrderId
				}
			}
		}
		errors
  }
}
 `;