import { Topic } from '../types';

export interface Flashcard {
  id: string;
  topicId: string;
  front: string;
  back: string;
  source: string;
}

// Purpose-written concept prompts for the free AZ-900 pilot. These are not
// converted from the practice-question bank.
export const az900Flashcards: Flashcard[] = [
  { id: 'cloud-benefits', topicId: 'describe-cloud-concepts', front: 'What does cloud elasticity mean?', back: 'Resources can scale up or down as demand changes, helping match capacity to workload.', source: 'Microsoft Learn: Describe cloud computing' },
  { id: 'capex-opex', topicId: 'describe-cloud-concepts', front: 'How does cloud computing change capital and operating expenses?', back: 'It can shift spending from buying and maintaining infrastructure (CapEx) toward paying for services as they are used (OpEx).', source: 'Microsoft Learn: Describe cloud computing' },
  { id: 'cloud-models', topicId: 'describe-cloud-concepts', front: 'What is the main difference between public, private, and hybrid cloud?', back: 'Public uses a provider-operated shared environment; private is dedicated to one organization; hybrid combines environments and connects them.', source: 'Microsoft Learn: Describe cloud computing' },
  { id: 'iaas', topicId: 'describe-cloud-concepts', front: 'What does IaaS provide, and what does the customer still manage?', back: 'IaaS provides virtualized infrastructure. The customer manages the operating system, applications, and data; the provider manages the physical infrastructure.', source: 'Microsoft Learn: Describe cloud service types' },
  { id: 'paas', topicId: 'describe-cloud-concepts', front: 'When is PaaS a useful cloud service model?', back: 'When a team wants to build and deploy applications while the provider manages the underlying infrastructure and runtime platform.', source: 'Microsoft Learn: Describe cloud service types' },
  { id: 'saas', topicId: 'describe-cloud-concepts', front: 'What responsibility typically remains with a SaaS customer?', back: 'The customer still manages their data, users, access, and configuration; the provider operates the application and its infrastructure.', source: 'Microsoft Learn: Describe cloud service types' },
  { id: 'regions', topicId: 'describe-azure-architecture', front: 'What is an Azure region?', back: 'A geographic area containing one or more datacenters connected through a low-latency network.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'availability-zones', topicId: 'describe-azure-architecture', front: 'How do Availability Zones improve resilience?', back: 'They place resources in physically separate datacenter locations within a region, reducing exposure to a single datacenter failure.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'region-pairs', topicId: 'describe-azure-architecture', front: 'What is an Azure region pair designed to support?', back: 'Regional disaster recovery and platform updates by pairing a region with another region in the same geography.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'resource-groups', topicId: 'describe-azure-architecture', front: 'What is an Azure resource group?', back: 'A logical container for Azure resources that you manage together, such as for deployment, access control, and lifecycle operations.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'subscriptions', topicId: 'describe-azure-architecture', front: 'What role does an Azure subscription play?', back: 'It provides a boundary for billing and resource management, and is associated with an Entra tenant for identity and access.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'management-groups', topicId: 'describe-azure-architecture', front: 'Why use Azure management groups?', back: 'To organize multiple subscriptions and apply governance, such as Azure Policy or access controls, across them.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'vnet', topicId: 'describe-azure-architecture', front: 'What does an Azure virtual network provide?', back: 'A private network boundary for Azure resources, including control over address spaces, subnets, routing, and connectivity.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'blob-storage', topicId: 'describe-azure-architecture', front: 'What kind of data is Azure Blob Storage designed to store?', back: 'Large amounts of unstructured object data, such as documents, images, backups, and media.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'serverless', topicId: 'describe-azure-architecture', front: 'What does serverless mean in Azure Functions?', back: 'You run event-driven code without managing the servers; the platform handles infrastructure and can scale based on demand.', source: 'Microsoft Learn: Describe Azure architecture and services' },
  { id: 'entra-id', topicId: 'describe-azure-identity', front: 'What is Microsoft Entra ID used for?', back: 'Cloud identity and access management, including authentication, single sign-on, and controlling access to resources.', source: 'Microsoft Learn: Describe Azure identity, access, and security' },
  { id: 'rbac', topicId: 'describe-azure-identity', front: 'What does Azure role-based access control (RBAC) determine?', back: 'Which actions an identity can perform on Azure resources, based on role assignments at a scope.', source: 'Microsoft Learn: Describe Azure identity, access, and security' },
  { id: 'mfa', topicId: 'describe-azure-identity', front: 'How does multifactor authentication strengthen sign-in security?', back: 'It requires more than one kind of proof of identity, reducing reliance on a password alone.', source: 'Microsoft Learn: Describe Azure identity, access, and security' },
  { id: 'azure-policy', topicId: 'describe-azure-management', front: 'What problem does Azure Policy help solve?', back: 'It evaluates resources against organizational rules and can audit or enforce compliant configurations.', source: 'Microsoft Learn: Describe Azure management and governance' },
  { id: 'cost-management', topicId: 'describe-azure-management', front: 'What can Azure Cost Management help teams do?', back: 'Monitor and analyze cloud spending, create budgets, and identify opportunities to control costs.', source: 'Microsoft Learn: Describe Azure management and governance' },
  { id: 'sla', topicId: 'describe-azure-management', front: 'What does an Azure service-level agreement (SLA) describe?', back: 'Microsoft’s commitment for service availability or connectivity, including the conditions and remedies defined for the service.', source: 'Microsoft Learn: Describe Azure management and governance' },
  { id: 'trust-center', topicId: 'describe-azure-management', front: 'Where can customers find Microsoft compliance and privacy information?', back: 'The Microsoft Service Trust Portal provides compliance documents, audit reports, and related trust resources.', source: 'Microsoft Learn: Describe Azure management and governance' },
];

export function flashcardTopicName(topics: Topic[], topicId: string): string {
  return topics.find((topic) => topic.id === topicId)?.name ?? 'AZ-900 concepts';
}
