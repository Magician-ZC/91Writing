import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@app/database';
import { CreatePackageDto } from '../../dto/create-package.dto';
import { UpdatePackageDto } from '../../dto/update-package.dto';
import { QueryPackageDto } from '../../dto/query-package.dto';
import { PackageStatus } from '@prisma/client';

@Injectable()
export class PackageService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPackageDto: CreatePackageDto) {
    // 检查套餐名称是否已存在
    const existingPackage = await this.prisma.package.findUnique({
      where: { name: createPackageDto.name },
    });

    if (existingPackage) {
      throw new BadRequestException('套餐名称已存在');
    }

    return this.prisma.package.create({
      data: createPackageDto,
    });
  }

  async findAll(query: QueryPackageDto) {
    const { status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [packages, total] = await Promise.all([
      this.prisma.package.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { sortOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      packages,
      pagination: {
        current: page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findActive() {
    return this.prisma.package.findMany({
      where: { status: PackageStatus.ACTIVE },
      orderBy: [
        { sortOrder: 'asc' },
        { price: 'asc' },
      ],
    });
  }

  async findOne(id: number) {
    const package_ = await this.prisma.package.findUnique({
      where: { id },
    });

    if (!package_) {
      throw new NotFoundException('套餐不存在');
    }

    return package_;
  }

  async update(id: number, updatePackageDto: UpdatePackageDto) {
    await this.findOne(id);

    // 如果更新名称，检查是否与其他套餐冲突
    if (updatePackageDto.name) {
      const existingPackage = await this.prisma.package.findUnique({
        where: { name: updatePackageDto.name },
      });

      if (existingPackage && existingPackage.id !== id) {
        throw new BadRequestException('套餐名称已存在');
      }
    }

    return this.prisma.package.update({
      where: { id },
      data: updatePackageDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    // 检查是否有活跃订阅
    const activeSubscriptions = await this.prisma.subscription.count({
      where: {
        packageId: id,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (activeSubscriptions > 0) {
      throw new BadRequestException('该套餐有活跃订阅，无法删除');
    }

    return this.prisma.package.delete({
      where: { id },
    });
  }
}
