import { BaseService } from '../../base.service';
import { Code, CodeModel } from '../../../db/models/codes.model';
import { CodeDto } from '../../codes/class-validator';
import { COLLECTIONS } from '../../../common/constant/tables';
import { PipelineStage } from 'mongoose';
import { getDateDDMMYYYY } from '../../../common/utility/data-formatter';

export class AnalyticsService extends BaseService<Code, CodeDto> {
  constructor(model: typeof CodeModel = CodeModel) {
    super(model);
  }

  async get(from: Date, to: Date) {
    const dateDifference = 86_400_000; // 24 * 60 * 60 * 1000;

    const $matchFromTo: PipelineStage.Match = {
      $match: {
        usedAt: {
          $gte: from.getTime(),
          $lte: to.getTime(),
        },
      },
    };

    const $projectBeforeMatch: PipelineStage.Project = {
      $project: {
        usedAt: {
          $toLong: {
            $toDate: '$usedAt',
          },
        },
        giftId: 1,
      },
    };

    const $project: PipelineStage.Project = {
      $project: {
        usedAt: {
          $multiply: [
            {
              $floor: {
                $divide: ['$usedAt', 86400000],
              },
            },
            86400000,
          ],
        },
        giftId: 1,
      },
    };

    const $group: PipelineStage.Group = {
      $group: {
        _id: '$usedAt',
        codesCount: { $sum: 1 },
        codesWithGiftCount: {
          $sum: {
            $cond: { if: '$giftId', then: 1, else: 0 },
          },
        },
      },
    };

    const $groupForPie: PipelineStage.Group = {
      $group: {
        _id: '$giftId',
        codesCount: { $sum: 1 },
      },
    };

    const $lookupGift: PipelineStage.Lookup = {
      $lookup: {
        from: COLLECTIONS.gifts,
        let: { giftId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$_id', '$$giftId'],
              },
            },
          },
          {
            $project: {
              _id: 1,
              id: 1,
              name: 1,
              image: 1,
              images: 1,
            },
          },
        ],
        as: 'gifts',
      },
    };

    const res = await this.model
      .aggregate([
        { $match: { deletedAt: null, isUsed: true, usedAt: { $ne: null } } },
        $projectBeforeMatch,
        $matchFromTo,
        $project,
        $group,
        { $sort: { _id: 1 } },
      ])
      .allowDiskUse(true);

    const resForPie = await this.model
      .aggregate([
        {
          $match: {
            deletedAt: null,
            isUsed: true,
            usedAt: { $ne: null },
            giftId: { $ne: null },
          },
        },
        $projectBeforeMatch,
        $matchFromTo,
        $project,
        $groupForPie,
        $lookupGift,
      ])
      .allowDiskUse(true);

    const pieData = Array(resForPie.length);
    for (let i = 0; i < resForPie.length; i++) {
      const gift = resForPie[i].gifts[0];
      pieData[i] = {
        value: resForPie[i].codesCount,
        name: gift?.name,
      };
    }

    if (res.length === 0) {
      return {
        dates: [getDateDDMMYYYY(from), getDateDDMMYYYY(to)],
        codesCount: [0],
        codesWithGiftCount: [0],
        pieData: pieData,
      };
    }
    const arrLen = res.length > 0 ? res.length : 1;
    const dates = Array(arrLen);
    const codesCount = Array(arrLen);
    const codesWithGiftCount = Array(arrLen);

    for (let i = 0; i < res.length; i++) {
      dates[i] = getDateDDMMYYYY(new Date(res[i]._id));
      codesCount[i] = res[i].codesCount;
      codesWithGiftCount[i] = res[i].codesWithGiftCount;
    }

    return {
      dates: dates,
      codesCount: codesCount,
      codesWithGiftCount: codesWithGiftCount,
      pieData: pieData,
    };
  }

  // private getDiagramdata(startAt: string, finishAt: string, diagram: GetDiagramResponse[]): IDiagram {
  //   const diagramObj: Record<string, GetDiagramResponse> = {}
  //   if (Array.isArray(diagram)) {
  //     for (const val of diagram) {
  //       diagramObj[`${val.year}.${val.month}.${val.date}`] = val;
  //     }
  //   }

  //   const res: IDiagram = {
  //     soldApartmentCount: 0,
  //     soldNonResidenttCount: 0,
  //     data: [],
  //     label: [],
  //   }

  //   const startDate = new Date(startAt);
  //   const endDate = new Date(finishAt);

  //   const diff = getDateDayDiff(endDate, startDate);
  //   const date = new Date(startAt);

  //   for (let i = 0; i <= diff; i++) {
  //     const key = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;

  //     res.data.push(
  //       diagramObj[key]
  //         ? diagramObj[key]
  //         : {
  //           count: 0,
  //           soldNonResidentCount: 0,
  //           soldResidentCount: 0,
  //           date: date.getDate(),
  //           month: date.getMonth() + 1,
  //           year: date.getFullYear(),
  //         }
  //     );
  //     res.label.push(date.getDate());
  //     date.setDate(date.getDate() + 1);
  //   }
  //   return res;
  // }
}

export const analyticsService = new AnalyticsService();
