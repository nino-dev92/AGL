import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "AGL API",
      version: "1.0.0",
      description: "AGL Backend API",
    },

    servers: [
      {
        url: "http://localhost:4000/api",
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },

      //   schemas: {
      //     Supplier: {
      //       type: "object",

      //       properties: {
      //         name: {
      //           type: "string",
      //           example: "Nestle",
      //         },

      //         contactPerson: {
      //           type: "string",
      //           example: "Richard",
      //         },

      //         phone: {
      //           type: "string",
      //           example: "08012345678",
      //         },

      //         email: {
      //           type: "string",
      //           example: "test@yahoo.com",
      //         },

      //         address: {
      //           type: "string",
      //           example: "7B Ruxton Road, Ikoyi",
      //         },
      //       },

      //       required: ["name", "contactPerson", "phone", "email", "address"],
      //     },
      //     SupplierUpdate: {
      //       type: "object",

      //       properties: {
      //         name: {
      //           type: "string",
      //           example: "Nestle",
      //         },

      //         contactPerson: {
      //           type: "string",
      //           example: "Richard",
      //         },

      //         phone: {
      //           type: "string",
      //           example: "08012345678",
      //         },

      //         email: {
      //           type: "string",
      //           example: "test@yahoo.com",
      //         },

      //         address: {
      //           type: "string",
      //           example: "Lagos",
      //         },
      //       },
      //     },
      //     RefundItem: {
      //       type: "object",
      //       properties: {
      //         productId: {
      //           type: "string",
      //           example: "6854d9dbf4e2c94d9f50c321",
      //         },
      //         quantity: {
      //           type: "number",
      //           example: 2,
      //         },
      //         price: {
      //           type: "number",
      //           example: 300,
      //         },
      //       },
      //     },
      //     CreateRefundRequest: {
      //       type: "object",
      //       required: ["items", "total", "reason"],
      //       properties: {
      //         items: {
      //           type: "array",
      //           items: {
      //             $ref: "#/components/schemas/RefundItem",
      //           },
      //         },
      //         total: {
      //           type: "number",
      //           example: 600,
      //         },
      //         reason: {
      //           type: "string",
      //           example: "Damaged goods",
      //         },
      //       },
      //     },
      //     SaleItem: {
      //       type: "object",
      //       properties: {
      //         productId: {
      //           type: "string",
      //           example: "6854d9dbf4e2c94d9f50c321",
      //         },
      //         quantity: {
      //           type: "number",
      //           example: 2,
      //         },
      //       },
      //     },
      //     SaleRequest: {
      //       type: "object",
      //       required: ["items", "paymentMethod"],
      //       properties: {
      //         items: {
      //           type: "array",
      //           items: {
      //             $ref: "#/components/schemas/SaleItem",
      //           },
      //         },
      //         paymentMethod: {
      //           type: "string",
      //           example: "CARD",
      //         },
      //       },
      //     },
      //     PurchaseOrderRequest: {
      //       type: "object",
      //       required: ["supplier", "items"],
      //       properties: {
      //         supplier: {
      //           type: "string",
      //           format: "objectId",
      //           example: "6854d9dbf4e2c94d9f50c123",
      //         },
      //         items: {
      //           type: "array",
      //           items: {
      //             type: "object",
      //             required: ["product", "quantity", "price"],
      //             properties: {
      //               product: {
      //                 type: "string",
      //                 format: "objectId",
      //                 example: "6854d9dbf4e2c94d9f50c456",
      //               },
      //               quantity: {
      //                 type: "integer",
      //                 example: 20,
      //               },
      //               price: {
      //                 type: "number",
      //                 example: 850,
      //               },
      //             },
      //           },
      //         },
      //       },
      //     },
      //     InventoryAdjustmentRequest: {
      //       type: "object",
      //       required: ["items", "type", "reason"],
      //       properties: {
      //         items: {
      //           type: "array",
      //           items: {
      //             type: "object",
      //             required: ["product", "quantity"],
      //             properties: {
      //               product: {
      //                 type: "string",
      //                 format: "objectId",
      //                 example: "6854d9dbf4e2c94d9f50c456",
      //               },
      //               quantity: {
      //                 type: "integer",
      //                 example: 20,
      //               },
      //             },
      //           },
      //         },
      //         type: {
      //           type: "string",
      //           enum: ["INCREASE", "DECREASE"],
      //           example: "DECREASE",
      //         },
      //         reason: {
      //           type: "string",
      //           example: "Damaged during transportation",
      //         },
      //       },
      //     },
      //   },
    },
  },

  apis: ["./src/routes/*.ts"],
};

export default swaggerJsdoc(options);
