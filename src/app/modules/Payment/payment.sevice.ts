import { join } from 'path';
import { Booking } from '../Booking/booking.model';
import { verifyPayment } from './payment.utils';
import { readFileSync } from 'fs';

const confirmationService = async (transactionID: string, status: string) => {
  const verifyResponce = await verifyPayment(transactionID);

  let result;
  let message = '';
  if (verifyResponce && verifyResponce.pay_status === 'Successful') {
    result = await Booking.findOneAndUpdate(
      { transactionID },
      {
          paymentStatus: 'Paid',
          isConfirmed: 'Confirmed',
      },
    );
    message = ` <h1 class ='success-payment'>Payment successful.!</h1>
      <h3>
        Your room has been booked successfully.! Thank you for choosing
        <span class="bold">Nexus Reserve</span>
      </h3>
      <p>
        You will receive a confirmation email with your booking details shortly.
      </p>
      <a href="/" class="button">Go to Home</a>`;
  } else {
    message = ` <h1 class ='failed-payment' >Payment Failed!</h1>
      <h3>
        Oops! Something went wrong with your payment.
        <span class="bold">Please verify your payment information and try again</span>!
      </h3>
      <p>
        If you need assistance, our support team is here to help..
      </p>
      <a href="/" class="button">Go to Home</a>
      `;
  }

  const filePath = join(__dirname, '../../views/confirmation.html');
  let template = readFileSync(filePath, 'utf8');
  template = template.replace('{{message}}', message);
  return template;
};

export const PaymentService = {
  confirmationService,
};
