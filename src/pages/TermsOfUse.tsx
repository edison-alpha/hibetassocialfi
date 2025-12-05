import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfUse() {
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
            Terms of Use
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
              1. Acceptance of Terms
            </h2>
            <p className="mb-4">
              By accessing and using HiBeats ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Use, please do not use the Platform.
            </p>
            <p>
              HiBeats is a decentralized SocialFi platform for AI-generated music creation, sharing, and trading. These terms govern your use of all features including music generation, NFT minting, social interactions, and blockchain transactions.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              2. User Accounts and Wallet Connection
            </h2>
            <p className="mb-4">
              To access certain features of HiBeats, you must connect a compatible Web3 wallet. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the security of your wallet and private keys</li>
              <li>All activities that occur under your wallet address</li>
              <li>Ensuring your wallet has sufficient funds for transactions</li>
              <li>Complying with your wallet provider's terms of service</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              3. AI Music Generation and Content
            </h2>
            <p className="mb-4">
              HiBeats provides AI-powered music generation tools. By using these tools:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You retain ownership of music you generate through the Platform</li>
              <li>You are responsible for ensuring your generated content doesn't infringe on third-party rights</li>
              <li>You grant HiBeats a non-exclusive license to display and distribute your content on the Platform</li>
              <li>You acknowledge that AI-generated content may have similarities to other works</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              4. NFTs and Blockchain Transactions
            </h2>
            <p className="mb-4">
              HiBeats enables minting and trading of music NFTs on the Somnia blockchain:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All blockchain transactions are final and irreversible</li>
              <li>You are responsible for gas fees and transaction costs</li>
              <li>NFT ownership is recorded on the blockchain and governed by smart contracts</li>
              <li>HiBeats does not control or guarantee the value of NFTs</li>
              <li>You acknowledge the risks associated with blockchain technology and cryptocurrency</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              5. Social Features and Interactions
            </h2>
            <p className="mb-4">
              The Platform includes social features such as likes, comments, tips, and messaging:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must not post offensive, illegal, or harmful content</li>
              <li>You are responsible for all interactions and communications</li>
              <li>Tips and payments are blockchain transactions and cannot be reversed</li>
              <li>HiBeats reserves the right to remove content that violates these terms</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              6. Rewards and BXP System
            </h2>
            <p className="mb-4">
              HiBeats features a rewards system with BXP (Beat Experience Points):
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>BXP is earned through platform activities and engagement</li>
              <li>Reward calculations and distributions are automated by smart contracts</li>
              <li>HiBeats reserves the right to modify the rewards system</li>
              <li>BXP has no guaranteed monetary value</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              7. Prohibited Activities
            </h2>
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the Platform for any illegal purposes</li>
              <li>Attempt to manipulate or exploit the rewards system</li>
              <li>Infringe on intellectual property rights of others</li>
              <li>Engage in spam, harassment, or abusive behavior</li>
              <li>Attempt to hack, disrupt, or compromise the Platform's security</li>
              <li>Create fake accounts or engage in fraudulent activities</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              8. Intellectual Property
            </h2>
            <p className="mb-4">
              The HiBeats platform, including its design, code, and branding, is protected by intellectual property rights. You may not copy, modify, or distribute any part of the Platform without permission.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              9. Disclaimers and Limitation of Liability
            </h2>
            <p className="mb-4">
              HiBeats is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Uninterrupted or error-free service</li>
              <li>The accuracy or quality of AI-generated content</li>
              <li>The security of blockchain transactions</li>
              <li>The value or liquidity of NFTs</li>
            </ul>
            <p className="mt-4">
              HiBeats shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Platform.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              10. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. Changes will be effective immediately upon posting. Your continued use of the Platform constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="font-clash font-semibold text-xl sm:text-2xl text-white mb-4">
              11. Contact Information
            </h2>
            <p>
              If you have questions about these Terms of Use, please contact us through our official channels or visit our support page.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/60 text-sm font-clash text-center">
            By using HiBeats, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
          </p>
        </div>
      </div>
    </div>
  );
}
