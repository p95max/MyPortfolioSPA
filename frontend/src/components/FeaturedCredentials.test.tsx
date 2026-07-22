import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Credential } from "../types";
import { FeaturedCredentials } from "./FeaturedCredentials";

const credentials: Credential[] = [
  {
    id: "python",
    title: "Python Essentials",
    issuer: "Cisco",
    credentialType: "certificate",
    issuedAt: "2026-01-01",
    imageUrl: "/python.png",
    category: "python",
    skills: ["Python"],
    isFeatured: true,
  },
  {
    id: "linux",
    title: "Linux Essentials",
    issuer: "Cisco",
    credentialType: "certificate",
    issuedAt: "2026-02-01",
    imageUrl: "/linux.png",
    category: "linux",
    skills: ["Linux"],
    isFeatured: true,
  },
  {
    id: "networking",
    title: "Networking Basics",
    issuer: "Cisco",
    credentialType: "certificate",
    issuedAt: "2026-03-01",
    imageUrl: "/networking.png",
    category: "networking",
    skills: ["Networking"],
    isFeatured: true,
  },
];

vi.mock("../hooks/useCredentials", () => ({
  useCredentials: () => ({
    credentials,
    error: null,
    isEmpty: false,
    loading: false,
  }),
}));

vi.mock("../analytics", () => ({
  trackCredentialLinkClick: vi.fn(),
  trackCredentialView: vi.fn(),
}));

describe("FeaturedCredentials", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });
  });

  it("renders featured certificates and carousel controls", () => {
    render(
      <MemoryRouter>
        <FeaturedCredentials />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Featured certificates" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "View all certificates" })).toHaveAttribute(
      "href",
      "/credentials",
    );
    expect(screen.getByLabelText("Certificate group 1 of 2")).toHaveTextContent("01 / 02");
  });

  it("supports buttons and keyboard navigation", () => {
    render(
      <MemoryRouter>
        <FeaturedCredentials />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next certificates" }));
    expect(screen.getByRole("button", { name: "Show certificate group 2" })).toHaveAttribute(
      "aria-current",
      "true",
    );

    fireEvent.keyDown(screen.getByRole("list", { name: "Featured certificates carousel" }), {
      key: "ArrowLeft",
    });
    expect(screen.getByRole("button", { name: "Show certificate group 1" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });
});
