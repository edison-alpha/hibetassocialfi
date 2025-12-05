import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#180a1f] via-[#0c0112] to-[#180a1f] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-clash text-sm">Back</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-clash font-bold text-3xl sm:text-4xl lg:text-5xl mb-4">
            Privacy Policy
          </h1>
          <p className="text-white/60 font-clash text-sm">
            Last updated: December 1, 2025
          </p>
          <p className="text-white/50 font-clash text-xs mt-1">
            by Team HiBeats
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 font-clash text-white/80 leading-relaxed font-normal">
          {/* Section 1 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              1. Introduction
            </h2>
            <p className="mb-4">
              Welcome to HiBeats. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our decentralized SocialFi platform for AI-generated music.
            </p>
            <p>
              HiBeats operates on blockchain technology, which means certain data is publicly visible and immutable by design. This policy helps you understand what data we collect and how we handle it.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              2. Information We Collect
            </h2>
            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-4">
              2.1 Blockchain Data
            </h3>
            <p className="mb-4">
              When you connect your wallet and use HiBeats, we collect:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Wallet address (public blockchain identifier)</li>
              <li>Transaction history on the Somnia blockchain</li>
              <li>NFT ownership and trading activity</li>
              <li>Smart contract interactions</li>
              <li>On-chain social interactions (likes, tips, comments)</li>
            </ul>

            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-6">
              2.2 Profile Information
            </h3>
            <p className="mb-4">
              You may provide:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Username and display name</li>
              <li>Profile picture and banner image</li>
              <li>Bio and social media links</li>
              <li>Music preferences and settings</li>
            </ul>

            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-6">
              2.3 Generated Content
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>AI-generated music and metadata</li>
              <li>Prompts and generation parameters</li>
              <li>Playlists and collections</li>
              <li>Posts, comments, and messages</li>
            </ul>

            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-6">
              2.4 Usage Data
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Device information and browser type</li>
              <li>IP address and location data</li>
              <li>Platform usage patterns and analytics</li>
              <li>Performance and error logs</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              3. How We Use Your Information
            </h2>
            <p className="mb-4">
              We use collected information to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and improve the HiBeats platform</li>
              <li>Process blockchain transactions and NFT operations</li>
              <li>Enable social features and interactions</li>
              <li>Calculate and distribute rewards (BXP)</li>
              <li>Personalize your experience and recommendations</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
              <li>Communicate updates and important information</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              4. Data Storage and Security
            </h2>
            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-4">
              4.1 Blockchain Data
            </h3>
            <p className="mb-4">
              Data stored on the Somnia blockchain is:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Publicly accessible and permanent</li>
              <li>Secured by blockchain cryptography</li>
              <li>Cannot be deleted or modified by HiBeats</li>
            </ul>

            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-6">
              4.2 Off-Chain Data
            </h3>
            <p className="mb-4">
              Data stored on our servers:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Is encrypted and protected with industry-standard security</li>
              <li>Stored on secure cloud infrastructure</li>
              <li>Backed up regularly to prevent data loss</li>
              <li>Access is restricted to authorized personnel only</li>
            </ul>

            <h3 className="font-clash font-semibold text-lg text-white mb-3 mt-6">
              4.3 Security Measures
            </h3>
            <p className="mb-4">
              We implement:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>End-to-end encryption for private messages</li>
              <li>Secure API endpoints and authentication</li>
              <li>Regular security audits and updates</li>
              <li>DDoS protection and rate limiting</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              5. Data Sharing and Third Parties
            </h2>
            <p className="mb-4">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Blockchain networks (public transaction data)</li>
              <li>AI service providers for music generation</li>
              <li>Cloud storage providers (AWS, IPFS)</li>
              <li>Analytics services (anonymized data)</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information to third parties.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="mb-4">
              HiBeats uses cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Remember your preferences and settings</li>
              <li>Analyze platform usage and performance</li>
              <li>Provide personalized content</li>
              <li>Enable social features</li>
            </ul>
            <p className="mt-4">
              You can manage cookie preferences in your browser settings or through our Cookie Settings page.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              7. Your Rights and Choices
            </h2>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of off-chain data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
            </ul>
            <p className="mt-4">
              Note: Blockchain data cannot be deleted due to its immutable nature.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              8. Children's Privacy
            </h2>
            <p>
              HiBeats is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              9. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of HiBeats after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              11. Contact Us
            </h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or how we handle your data, please contact us through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Our support page on the platform</li>
              <li>Official social media channels</li>
              <li>Community Discord server</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm font-clash text-center">
            By using HiBeats, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
