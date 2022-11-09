<template>
  <div class="terms bg-color-dark">
    <div class="container">
      <!-- ====================== NAVBAR ====================== -->
      <div
        class=""
        style="
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: black;
        "
      >
        <div
          class="container is-flex is-justify-content-space-between py-6"
          :class="{ 'px-5': !isDesktop }"
        >
          <img
            :width="[isMobile ? 40 : 52]"
            src="../assets/img/logo.svg"
            alt=""
          />
          <div class="is-flex is-align-items-center">
            <a
              href="/"
              class="btn-secondary"
              style="text-align: center; text-transform: lowercase"
              :style="[
                isMobile
                  ? { width: '120px', fontSize: '0.8rem' }
                  : { width: '180px', fontSize: '1.2rem' },
              ]"
            >
              Home</a
            >
            <a
              class="btn-primary ml-3"
              href="https://hackmd.io/@irenegia/BkqNihVY5"
              target="_blank"
              style="
                text-align: center;
                text-transform: lowercase;
                font-size: 1.2rem;
              "
              :style="[
                isMobile
                  ? { width: '120px', fontSize: '0.8rem' }
                  : { width: '180px', fontSize: '1.2rem' },
              ]"
            >
              paper
            </a>
          </div>
        </div>
      </div>
      <!-- ====================== NAVBAR ====================== -->

      <div class="px-6" style="padding-top: 160px">
        <div class="pb-6">
          <h4>Terms of service</h4>
          <div class="" style="text-align: justify">
            <p>
              The following terms and conditions govern all use of the„
              retriev.org website (the “Website”) and all content, services and
              products available at or through the Website, including the
              retrieval-pinning API available on
              https://github.com/protocol/retrieval-pinning (the “Services”).
            </p>

            <p class="mt-4">
              Please read these terms carefully. If you don’t agree to all of
              these terms and conditions (“Terms” or “TOS”), you are prohibited
              from using or accessing this Website or using the Services.
            </p>

            <p class="mt-4">
              Protocol Labs, Inc. (“we,” “us”) may make changes to these Terms
              from time to time. If you don’t agree to these revisions, you
              should stop using the Services.
            </p>

            <p class="mt-4">
              <b>Data on IPFS and Filecoin Network</b><br />
              All data uploaded using the Services will be available on IPFS and
              the Filecoin network. Data on IPFS and/or the Filecoin network is
              available to anyone who requests it using the correct CID. You
              should not load any private, personal or sensitive information in
              an unencrypted form using the Services. Please note that nodes on
              the IPFS network may retain copies of the data indefinitely. You
              should not use the Services to pin data that may need to be
              permanently deleted in the future.
            </p>

            <p class="mt-4">
              <b>Disclaimer of Warranties</b><br />
              The Services are provided “as is” without any express or implied
              warranties such as the warranties of merchantability, fitness for
              a particular purpose and non-infringement. We don’t make any
              warranty that the Services will be error-free or reliable, or that
              you’ll have continuous, uninterrupted access to the Services.
            </p>

            <p class="mt-4">
              You understand that you upload, store, pin, retrieve, otherwise
              obtain Content using our Services at your own discretion and risk.
              You also understand and agree that you may incur transaction fees
              when interacting with blockchains via our Services.
            </p>

            <p class="mt-4">
              <b>Acceptable Use</b><br />
              You are entirely responsible for all data you send or cause to be
              sent through the Services (“Content”) - and you’re also
              responsible for any harm resulting from that Content. For your own
              protection and the protection of the network & community, you may
              not use the Services for activities such as:
            </p>

            <p class="mt-4">
              ● Scams, Spam, and Server Misuse - Don’t use our Services in
              fraudulent, deceptive, or harmful ways like:
            </p>
            <div class="ml-5 mt-2 mb--2">
              <p>
                ○ Introducing viruses or malware<br />
                ○ Tricking or misleading users, such as by phishing, spoofing,
                or impersonating other people or companies <br />○ Posting or
                distributing spam<br />
                ○ Interfering with, disrupting, or creating an undue burden on
                the Services or networks/services connected to the Services.
              </p>
            </div>

            <p class="mt-4">
              ● Infringing Others’ Rights - Don’t use our Services in a way that
              violates the rights of others, such as:
            </p>
            <div class="ml-5 mt-2 mb--2">
              <p>
                ○ Copyright, patent, trademark or trade secret rights<br />
                ○ Third-party licenses<br />
                ○ Privacy and publicity rights.
              </p>
            </div>

            <p class="mt-4">
              ● Other Harmful and Unlawful Purposes - Don’t use our Services to:
            </p>
            <div class="ml-5 mt-2 mb--2">
              <p>
                ○ Solicit unlawful services or post obscene material that is
                unlawful<br />
                ○ Incite violence or threaten others<br />
                ○ Post or distribute child sexual abuse material or content
                encouraging or inciting terrorism<br />
                ○ Act in a way that’s reasonably likely to cause or increase the
                risk of harm to any person(s) or group(s).
              </p>
            </div>

            <p class="mt-4">
              We have the right (but not the obligation) to, in our sole
              discretion, (i) refuse, remove, or disable any Content; (ii) block
              uploads, or (iii) temporarily or permanently suspend access to the
              Services if we determine you’ve breached the TOS in any way. We
              will not have any obligation to compensate you if this occurs.
            </p>

            <p class="mt-4">
              In order to use the Services you must be 13 years of age or older.
              If you are 13 or older but under 18 years of age, you must have
              your parent or legal guardian’s permission to use the Services and
              to accept the terms of this TOS.
            </p>

            <p class="mt-4">
              <b>
                Limitation of Liability To the extent permitted by law, our
                liability for any claims relating to or arising out of these
                Terms, including for any implied warranties, is limited to the
                amount you’ve paid us to use the Services within the past (6)
                months, if anything.</b
              >
            </p>

            <p class="mt-4">
              <b
                >We will not be liable to you for any lost profits or other
                special, incidental or consequential damages related to or
                arising out of the Services, such as (a) the cost of procuring
                substitute products or services; (b) for service interruptions,
                loss of files, or data corruption.</b
              >
            </p>

            <p class="mt-4">
              <b>General Representation and Warranty</b><br />
              You must follow all applicable laws when using our Services,
              including laws regarding the transmission of technical data
              exported from the country in which you reside and in which the
              Service you are using resides. You agree that your use of the
              Services will not infringe on any third party’s intellectual
              property rights.
            </p>

            <p class="mt-4">
              <b>Indemnification</b> <br />To the extent allowed by applicable
              law, you’ll indemnify us and our directors, officers, employees,
              and contractors for any third-party legal proceedings (including
              actions by government authorities) arising out of or relating to
              your unlawful use of the services or violation of these Terms.
            </p>

            <p class="mt-4">
              <b>Miscellaneous</b> <br />
              These Terms constitute the entire agreement between you and
              Protocol Labs concerning the Services.
            </p>

            <p class="mt-4">
              California law will govern all disputes arising out of or relating
              to these terms, regardless of conflict of laws rules. These
              disputes will be resolved exclusively in the federal or state
              courts of San Francisco County, California, USA, and you consent
              to personal jurisdiction in those courts.
            </p>

            <p class="mt-4">
              If it turns out that a particular term is not valid or
              enforceable, this will not affect any other terms.
            </p>
            <p class="mt-4">
              Our failure to enforce a provision is not a waiver of its right to
              do so later.
            </p>

            <p class="mt-4">
              You may not assign any of your rights under these Terms without
              our prior written consent. Any other attempt to assign your rights
              under the Terms is void. We may assign our rights under these
              Terms to any of our affiliates or subsidiaries, or to any
              successor in interest of any business associated with the
              Services.
            </p>
            <p class="mt-4">
              This document is CC-BY-SA. It was last updated October 21, 2022.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import checkViewport from "../mixins/checkViewport";

export default {
  name: "Terms",
  mixins: [checkViewport],
  data() {
    return {};
  },
};
</script>
