import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { trackCredentialView } from "../analytics";
import type { Credential } from "../types";
import { CredentialCard } from "./CredentialCard";

vi.mock("../analytics", () => ({
  trackCredentialLinkClick: vi.fn(),
  trackCredentialView: vi.fn(),
}));

const certificate: Credential = {
  id: "python-certificate",
  title: "Crash Course on Python",
  issuer: "Google / Coursera",
  credentialType: "certificate",
  issuedAt: "2025-05-10",
  credentialUrl: "https://example.com/verify",
  imageUrl: "https://example.com/certificate.png",
  category: "python",
  skills: ["Python"],
  isFeatured: true,
};

describe("CredentialCard", () => {
  it("opens a certificate preview from the image instead of a separate button", async () => {
    const user = userEvent.setup();

    render(<CredentialCard credential={certificate} />);

    expect(
      screen.queryByRole("button", { name: /view certificate/i }),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /open certificate preview: crash course on python/i,
      }),
    );

    expect(trackCredentialView).toHaveBeenCalledWith(certificate);
    expect(
      screen.getByRole("dialog", { name: /crash course on python/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /verify credential/i }),
    ).toHaveAttribute("href", certificate.credentialUrl);
  });
});
