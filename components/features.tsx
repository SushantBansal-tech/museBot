"use client"

import { useTranslation } from "@/hooks/use-translation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Globe, BarChart, CreditCard, MessageSquare, Shield, Users, Zap } from "lucide-react"

export function Features() {
  const { t } = useTranslation()

  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: t("feature_efficiency_title"),
      description: t("feature_efficiency_desc"),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t("feature_multilingual_title"),
      description: t("feature_multilingual_desc"),
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      title: t("feature_analytics_title"),
      description: t("feature_analytics_desc"),
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: t("feature_payment_title"),
      description: t("feature_payment_desc"),
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: t("feature_chatbot_title"),
      description: t("feature_chatbot_desc"),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t("feature_security_title"),
      description: t("feature_security_desc"),
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t("feature_customer_service_title"),
      description: t("feature_customer_service_desc"),
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: t("feature_error_reduction_title"),
      description: t("feature_error_reduction_desc"),
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">{t("features_title")}</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("features_description")}
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
          {features.map((feature, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <div className="p-2 w-fit rounded-md bg-primary/10 mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

