# Testcase

## OrderService class

* Process the order with a coupon is success
* Process the order with multi products with a coupon is success
* Process the order without a coupon is success
* Process the order with multi products without a coupon is success
* Apply coupon discount to total price make it less than 0, execute success
* Throw an error if items are missing
* Throw an error if item prices or quantities are invalid
* Throw an error with error coupon

## PaymentService class
* Include all payment methods when totalPrice is below all thresholds
* Exclude only AUPAY when totalPrice exceeds 300,000 and less 500,000
* Exclude both PAYPAY and AUPAY when totalPrice exceeds both thresholds
* Open a new window with the correct payment URL
