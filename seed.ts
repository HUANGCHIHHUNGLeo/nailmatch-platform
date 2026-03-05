import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const artist = await prisma.artist.create({
        data: {
            displayName: 'Mock Artist',
            gender: 'Female',
            phone: '0912345678',
            cities: ['台北市'],
            serviceLocationType: '工作室',
            services: ['手部美甲', '足部美甲'],
            styles: ['單色凝膠', '貓眼'],
            minPrice: 1000,
            maxPrice: 2000,
            isActive: true,
            isVerified: true
        }
    });

    const customer = await prisma.customer.create({
        data: {
            displayName: 'Test Customer',
            nickname: 'Customer',
            gender: 'Female'
        }
    });

    await prisma.serviceRequest.create({
        data: {
            customerId: customer.id,
            locations: ['台北市'],
            services: ['手部美甲'],
            budgetRange: 'NT$1000-2000',
            preferredDate: '明天',
            status: 'pending',
            customerGender: 'Female',
            nailLength: '短',
            preferredStyles: ['單色凝膠'],
            artistGenderPref: '不限',
            needsRemoval: '否',
            referenceImages: [],
            additionalNotes: 'Test request'
        }
    });
    console.log('Seed done!');
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
