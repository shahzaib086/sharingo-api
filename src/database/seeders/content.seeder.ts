import { DataSource } from 'typeorm';
import { Content } from '../../entities/content.entity';

export class ContentSeeder {
  constructor(private readonly dataSource: DataSource) {}

  async run() {
    const contentRepository = this.dataSource.getRepository(Content);

    // Check if content already exists
    const existingTerms = await contentRepository.findOne({
      where: { key: 'terms_and_conditions' },
    });

    const existingPrivacy = await contentRepository.findOne({
      where: { key: 'privacy_policy' },
    });

    // Seed Terms and Conditions
    if (!existingTerms) {
      const termsAndConditions = contentRepository.create({
        key: 'terms_and_conditions',
        heading: 'Terms and Conditions',
        subheading: 'Please read these terms carefully before using our service',
        body: `<h1>Terms and Conditions</h1>

<h2>1. Acceptance of Terms</h2>
<p>By accessing and using Sharingo, you accept and agree to be bound by the terms and provision of this agreement.</p>

<h2>2. Use License</h2>
<p>Permission is granted to temporarily download one copy of the materials (information or software) on Sharingo's website for personal, non-commercial transitory viewing only.</p>

<h2>3. Disclaimer</h2>
<p>The materials on Sharingo's website are provided on an 'as is' basis. Sharingo makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>

<h2>4. Limitations</h2>
<p>In no event shall Sharingo or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Sharingo's website, even if Sharingo or a Sharingo authorized representative has been notified orally or in writing of the possibility of such damage.</p>

<h2>5. Accuracy of Materials</h2>
<p>The materials appearing on Sharingo's website could include technical, typographical, or photographic errors. Sharingo does not warrant that any of the materials on its website are accurate, complete or current.</p>

<h2>6. Links</h2>
<p>Sharingo has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Sharingo of the site.</p>

<h2>7. Modifications</h2>
<p>Sharingo may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms and Conditions of Service.</p>

<h2>8. Governing Law</h2>
<p>These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.</p>`,
        status: 1,
      });
      await contentRepository.save(termsAndConditions);
      console.log('✅ Terms and Conditions seeded successfully');
    } else {
      console.log('⚠️ Terms and Conditions already exists, skipping...');
    }

    // Seed Privacy Policy
    if (!existingPrivacy) {
      const privacyPolicy = contentRepository.create({
        key: 'privacy_policy',
        heading: 'Privacy Policy',
        subheading: 'How we collect, use, and protect your information',
        body: `<h1>Privacy Policy</h1>

<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us.</p>

<h3>Personal Information</h3>
<ul>
<li>Name and contact information</li>
<li>Profile information and preferences</li>
<li>Communication history</li>
<li>Usage data and analytics</li>
</ul>

<h3>Automatically Collected Information</h3>
<ul>
<li>Device information</li>
<li>Log data</li>
<li>Cookies and similar technologies</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve our services</li>
<li>Process transactions and send related information</li>
<li>Send technical notices, updates, security alerts, and support messages</li>
<li>Respond to your comments, questions, and customer service requests</li>
<li>Communicate with you about products, services, offers, and events</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

<h3>We may share your information with:</h3>
<ul>
<li>Service providers who assist in our operations</li>
<li>Legal authorities when required by law</li>
<li>Business partners with your explicit consent</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

<h2>5. Data Retention</h2>
<p>We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.</p>

<h2>6. Your Rights</h2>
<p>You have the right to:</p>
<ul>
<li>Access your personal information</li>
<li>Correct inaccurate information</li>
<li>Request deletion of your information</li>
<li>Opt-out of certain communications</li>
<li>Export your data</li>
</ul>

<h2>7. Cookies and Tracking</h2>
<p>We use cookies and similar technologies to enhance your experience and collect usage information.</p>

<h2>8. Third-Party Services</h2>
<p>Our service may contain links to third-party websites or services. We are not responsible for their privacy practices.</p>

<h2>9. Children's Privacy</h2>
<p>Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>

<h2>10. Changes to This Policy</h2>
<p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>

<h2>11. Contact Us</h2>
<p>If you have any questions about this privacy policy, please contact us at <a href="mailto:drtonyroach@yahoo.com">drtonyroach@yahoo.com</a>.</p>`,
        status: 1,
      });
      await contentRepository.save(privacyPolicy);
      console.log('✅ Privacy Policy seeded successfully');
    } else {
      console.log('⚠️ Privacy Policy already exists, skipping...');
    }
  }
} 