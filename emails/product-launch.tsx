import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface ProductLaunchEmailProps {
  appName: string;
  appDescription: string;
  appUrl: string;
  logoUrl?: string;
  subscriberName?: string;
  features?: string[];
}

export const ProductLaunchEmail = ({
  appName,
  appDescription,
  appUrl,
  logoUrl,
  subscriberName,
  features = [],
}: ProductLaunchEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        {appName} is now live! Check out what we've built for you.
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {logoUrl && (
            <Section style={logoSection}>
              <Img src={logoUrl} alt={appName} style={logo} />
            </Section>
          )}
          <Heading style={h1}>We're Live! 🎉</Heading>
          <Text style={text}>
            {subscriberName ? `Hi ${subscriberName},` : 'Hi there,'}
          </Text>
          <Text style={text}>
            After months of hard work, <strong>{appName}</strong> is finally here!
          </Text>
          <Text style={text}>{appDescription}</Text>

          {features.length > 0 && (
            <>
              <Text style={featuresHeading}>What you can do:</Text>
              <ul style={featuresList}>
                {features.map((feature, index) => (
                  <li key={index} style={featureItem}>
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <Section style={buttonSection}>
            <Button style={button} href={appUrl}>
              Get Started Now
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Thanks for being an early supporter. We can't wait to hear what you think!
          </Text>
          <Text style={footer}>
            Questions? Just reply to this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ProductLaunchEmail;

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
  maxWidth: '600px',
};

const logoSection = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const logo = {
  width: '80px',
  height: '80px',
};

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 24px',
};

const featuresHeading = {
  ...text,
  fontWeight: 'bold',
  marginBottom: '8px',
};

const featuresList = {
  margin: '0 24px 24px 48px',
  padding: 0,
};

const featureItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginBottom: '8px',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#667eea',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 24px',
  textAlign: 'center' as const,
};
