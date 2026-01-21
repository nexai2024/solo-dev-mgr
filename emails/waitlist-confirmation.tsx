import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface WaitlistConfirmationEmailProps {
  appName: string;
  confirmationUrl: string;
  subscriberName?: string;
}

export const WaitlistConfirmationEmail = ({
  appName,
  confirmationUrl,
  subscriberName,
}: WaitlistConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Confirm your subscription to {appName} waitlist</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to {appName}!</Heading>
          <Text style={text}>
            {subscriberName ? `Hi ${subscriberName},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            Thanks for joining the {appName} waitlist! We're excited to have you on board.
          </Text>
          <Text style={text}>
            Please confirm your email address by clicking the button below:
          </Text>
          <Link href={confirmationUrl} style={button}>
            Confirm Email
          </Link>
          <Text style={footer}>
            If you didn't sign up for this waitlist, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default WaitlistConfirmationEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
  margin: '24px',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '24px',
  textAlign: 'center' as const,
};
