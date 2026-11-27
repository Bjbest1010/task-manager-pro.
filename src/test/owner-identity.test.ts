import { describe, expect, it } from "vitest";

import {
  OWNER_EMAIL,
  OWNER_NAME,
  OWNER_PHONE,
  STORAGE_KEY,
  migrateProfile,
  resetDemo,
  type Profile,
} from "@/lib/store";

const base: Profile = {
  name: OWNER_NAME,
  email: OWNER_EMAIL,
  phone: OWNER_PHONE,
  location: "",
  headline: "",
  education: "",
  experience: "",
};

describe("Owner identity", () => {
  it("seeds the profile with the owner's exact name, email and phone", () => {
    resetDemo();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as { profile: Profile };

    expect(saved.profile.name).toBe("Bishara Bare Sahal");
    expect(saved.profile.email).toBe("bbishara99@gmail.com");
    expect(saved.profile.phone).toBe("0114726411");
  });

  it("replaces the earlier placeholder identity in data already saved in the browser", () => {
    const fixed = migrateProfile({
      ...base,
      name: "Amina Yusuf",
      email: "bishara.sahal@example.com",
      phone: "+254 712 345 678",
    });

    expect(fixed.name).toBe("Bishara Bare Sahal");
    expect(fixed.email).toBe("bbishara99@gmail.com");
    expect(fixed.phone).toBe("0114726411");
  });

  it("keeps contact details the owner typed themselves", () => {
    const kept = migrateProfile({
      ...base,
      name: "Bishara Bare Sahal",
      email: "bishara@mycompany.co.ke",
      phone: "0700 111 222",
    });

    expect(kept.name).toBe("Bishara Bare Sahal");
    expect(kept.email).toBe("bishara@mycompany.co.ke");
    expect(kept.phone).toBe("0700 111 222");
  });
});
