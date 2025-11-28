import type {
  Company,
  CompanyUser,
  RegistrationRequest,
  UserRole,
} from "@/models/types";

// Mock companies database
const companies: Company[] = [
  {
    id: "c1",
    name: "FreshFarm Co.",
    registrationNumber: "REG-001",
    address: "ul. Zbożowa 10",
    city: "Warszawa",
    postalCode: "00-001",
    country: "Polska",
    email: "contact@freshfarm.pl",
    phone: "+48123456789",
    createdAt: "2024-01-15T10:00:00Z",
    active: true,
  },
  {
    id: "c2",
    name: "GreenGrocer Ltd.",
    registrationNumber: "REG-002",
    address: "ul. Handlowa 5",
    city: "Kraków",
    postalCode: "31-000",
    country: "Polska",
    email: "info@greengrocer.pl",
    phone: "+48987654321",
    createdAt: "2024-02-20T14:30:00Z",
    active: true,
  },
];

// Mock company users database
const companyUsers: CompanyUser[] = [
  {
    id: "1",
    name: "Anna Kowalska",
    email: "anna@example.com",
    role: "company_admin",
    companyId: "c1",
    companyName: "FreshFarm Co.",
    userRole: "admin",
    active: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    companyId: "c1",
    companyName: "FreshFarm Co.",
    userRole: "manager",
    active: true,
    createdAt: "2024-01-16T10:00:00Z",
  },
];

// Mock registration requests database
const registrationRequests: RegistrationRequest[] = [
  {
    id: "reg1",
    companyName: "EcoFresh Sp. z o.o.",
    registrationNumber: "REG-003",
    address: "ul. Ekocentrum 15",
    city: "Wrocław",
    postalCode: "51-000",
    country: "Polska",
    contactEmail: "admin@ecofresh.pl",
    contactName: "Piotr Nowak",
    phone: "+48555123456",
    status: "pending",
    createdAt: "2024-12-10T09:00:00Z",
  },
  {
    id: "reg2",
    companyName: "BioProducts Inc.",
    registrationNumber: "REG-004",
    address: "ul. Naturalna 20",
    city: "Gdańsk",
    postalCode: "80-000",
    country: "Polska",
    contactEmail: "contact@bioproducts.pl",
    contactName: "Maria Zielińska",
    status: "approved",
    createdAt: "2024-11-05T11:30:00Z",
    reviewedAt: "2024-11-06T10:00:00Z",
    reviewedBy: "2",
  },
];

// Company Management
export async function getAllCompanies(): Promise<Company[]> {
  return delay([...companies], 200);
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const company = companies.find((c) => c.id === id);
  return delay(company ?? null, 150);
}

export async function createCompany(data: {
  name: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  phone?: string;
}): Promise<Company> {
  const company: Company = {
    id: `c${companies.length + 1}`,
    ...data,
    createdAt: new Date().toISOString(),
    active: true,
  };
  companies.push(company);
  return delay(company, 200);
}

export async function updateCompany(
  id: string,
  data: Partial<Omit<Company, "id" | "createdAt">>,
): Promise<Company | null> {
  const index = companies.findIndex((c) => c.id === id);
  if (index === -1) return delay(null, 150);
  companies[index] = { ...companies[index], ...data };
  return delay(companies[index], 150);
}

export async function toggleCompanyActive(
  id: string,
  active: boolean,
): Promise<Company | null> {
  return updateCompany(id, { active });
}

// Company Users Management
export async function getCompanyUsers(companyId: string): Promise<CompanyUser[]> {
  const users = companyUsers.filter((u) => u.companyId === companyId);
  return delay([...users], 200);
}

export async function getAllUsers(): Promise<CompanyUser[]> {
  return delay([...companyUsers], 200);
}

export async function createCompanyUser(data: {
  companyId: string;
  name: string;
  email: string;
  userRole: UserRole;
}): Promise<CompanyUser> {
  const user: CompanyUser = {
    id: `user${companyUsers.length + 1}`,
    name: data.name,
    email: data.email,
    role: "company_user",
    companyId: data.companyId,
    companyName:
      companies.find((c) => c.id === data.companyId)?.name || "Unknown",
    userRole: data.userRole,
    active: true,
    createdAt: new Date().toISOString(),
  };
  companyUsers.push(user);
  return delay(user, 200);
}

export async function updateCompanyUser(
  id: string,
  data: Partial<
    Omit<CompanyUser, "id" | "role" | "companyId" | "createdAt">
  >,
): Promise<CompanyUser | null> {
  const index = companyUsers.findIndex((u) => u.id === id);
  if (index === -1) return delay(null, 150);
  companyUsers[index] = { ...companyUsers[index], ...data };
  return delay(companyUsers[index], 150);
}

export async function deleteCompanyUser(id: string): Promise<boolean> {
  const index = companyUsers.findIndex((u) => u.id === id);
  if (index === -1) return delay(false, 150);
  companyUsers.splice(index, 1);
  return delay(true, 150);
}

export async function toggleCompanyUserActive(
  id: string,
  active: boolean,
): Promise<CompanyUser | null> {
  return updateCompanyUser(id, { active });
}

export async function updateUserRole(
  id: string,
  userRole: UserRole,
): Promise<CompanyUser | null> {
  return updateCompanyUser(id, { userRole });
}

export async function resetUserPassword(id: string): Promise<string> {
  // In real app, this would send an email with a reset link
  const tempPassword = `TEMP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  // Store temp password in a real app
  return delay(tempPassword, 200);
}

// Registration Requests Management
export async function getAllRegistrationRequests(): Promise<RegistrationRequest[]> {
  return delay([...registrationRequests], 200);
}

export async function getRegistrationRequestById(id: string): Promise<RegistrationRequest | null> {
  const request = registrationRequests.find((r) => r.id === id);
  return delay(request ?? null, 150);
}

export async function getRegistrationRequestsByStatus(
  status: RegistrationRequest["status"],
): Promise<RegistrationRequest[]> {
  const requests = registrationRequests.filter((r) => r.status === status);
  return delay([...requests], 200);
}

export async function createRegistrationRequest(data: {
  companyName: string;
  registrationNumber: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  contactEmail: string;
  contactName: string;
  phone?: string;
}): Promise<RegistrationRequest> {
  const request: RegistrationRequest = {
    id: `reg${registrationRequests.length + 1}`,
    ...data,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  registrationRequests.push(request);
  return delay(request, 200);
}

export async function approveRegistrationRequest(
  id: string,
  reviewedBy: string,
): Promise<RegistrationRequest | null> {
  const index = registrationRequests.findIndex((r) => r.id === id);
  if (index === -1) return delay(null, 150);

  const request = registrationRequests[index];
  registrationRequests[index] = {
    ...request,
    status: "approved",
    reviewedAt: new Date().toISOString(),
    reviewedBy,
  };

  // Create company from approved request
  if (registrationRequests[index].status === "approved") {
    await createCompany({
      name: registrationRequests[index].companyName,
      registrationNumber: registrationRequests[index].registrationNumber,
      address: registrationRequests[index].address,
      city: registrationRequests[index].city,
      postalCode: registrationRequests[index].postalCode,
      country: registrationRequests[index].country,
      email: registrationRequests[index].contactEmail,
      phone: registrationRequests[index].phone,
    });
  }

  return delay(registrationRequests[index], 200);
}

export async function rejectRegistrationRequest(
  id: string,
  rejectionReason: string,
  reviewedBy: string,
): Promise<RegistrationRequest | null> {
  const index = registrationRequests.findIndex((r) => r.id === id);
  if (index === -1) return delay(null, 150);

  const request = registrationRequests[index];
  registrationRequests[index] = {
    ...request,
    status: "rejected",
    rejectionReason,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
  };

  return delay(registrationRequests[index], 200);
}

export async function editRegistrationRequest(
  id: string,
  data: Partial<
    Omit<
      RegistrationRequest,
      "id" | "status" | "createdAt" | "reviewedAt" | "reviewedBy" | "rejectionReason"
    >
  >,
): Promise<RegistrationRequest | null> {
  const index = registrationRequests.findIndex((r) => r.id === id);
  if (index === -1) return delay(null, 150);
  registrationRequests[index] = { ...registrationRequests[index], ...data };
  return delay(registrationRequests[index], 150);
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}
