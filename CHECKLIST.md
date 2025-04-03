# Testcase

## OrderService class

* process the order with a coupon is success
* process the order with multi products with a coupon is success
* process the order without a coupon is success
* process the order with multi products without a coupon is success
* Apply coupon discount to total price make it less than 0, execute success
* throw an error if items are missing
* throw an error if item prices or quantities are invalid
* throw an error with error coupon

## PaymentService class
* Include all payment methods when totalPrice is below all thresholds
* Exclude only AUPAY when totalPrice exceeds 300,000 and less 500,000
* Exclude both PAYPAY and AUPAY when totalPrice exceeds both thresholds
* Open a new window with the correct payment URL
